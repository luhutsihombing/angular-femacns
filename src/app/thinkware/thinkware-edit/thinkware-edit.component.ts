import {MAT_DATE_FORMATS} from '@angular/material';
import {ThinkwareService} from '../_service/thinkware.service';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {combineLatest, interval, Observable, of} from 'rxjs';
import {concatMap, debounceTime, distinctUntilChanged, filter, finalize, map} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {ActivatedRoute} from '@angular/router';
import {ThinkwareSuggestion, ThinkwareSave, DetailII, DetailQCC,
    DetailQCP, DetailSS, DetailMember, Thinkware, Attachment, IsPIC, LookupAttachment} from '../_model/thinkware.model';
import { REGEX_FILE_NAME } from '../../_const/regex.const';

import * as $ from 'jquery';
import * as moment from 'moment';
import { DatePipe, Location } from '@angular/common';
import { AuthService } from '../../auth/_service/auth.service';
import { API_DOMAIN } from '../../_const/api.const';

@Component({
    selector: 'fema-cms-thinkware-edit',
    templateUrl: './thinkware-edit.component.html',
    styleUrls: ['./thinkware-edit.component.scss'],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {dateInput: 'LL'},
                display: {
                    dateInput: 'DD-MMM-YYYY',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})

export class ThinkwareEditComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDateTime: Observable<object>;
    thinkwareForm: FormGroup;

    IISubCategory = [
        {value : '', label: '- - Please Select -'}
    ];
    QCCSubCategory = [];
    QCPSubCategory = [];
    suggestionMember = [];

    memberCounter = 0;

    branchSave: string;
    branchName: string;

    toolTipII: any;
    toolTipQCC: any;
    toolTipQCP: any;
    toolTipSS: any;
    isPIC: IsPIC;
    thinkw: Thinkware;
    detailmembers: DetailMember[];
    idExist: string;
    idMemberII: string;
    idMemberSS: string;
    idMemberQCP: string;
    idMemberQCC: string;
    categoryM: string;
    QCCEmit: FormGroup;
    QCPEmit: FormGroup;
    IIEmit: FormGroup;
    SSEmit: FormGroup;
    attachmentEmit: FormGroup;
    attachmentLebihEmit: any;
    existAttachment: any;
    tipeEmit: any;
    now = new Date();
    QCCFormIsValid = false;
    QCPFormIsValid = false;
    IIFormIsValid = false;
    SSFormIsValid = false;

    placeHolderNamaLeader = 'Nama Team Leader';
    checkEdit: string;

    //  digunakan untuk suggestion
    thinkwareSuggestions: ThinkwareSuggestion[];
    suggestionCheck: ThinkwareSuggestion[];
    checkII: string;
    checkSS: string;
    checkQCP: string;
    checkQCC: string;
    responseOnAction: ActionResponse;
    errorOnInit: ErrorResponse;

    // keterangan error initial setup
    PIC = false;
    // periode = false;
    subkategori = false;
    // maxAttachment = false;
    maxMember = false;
    aer = false;
    // akhir keterangan error initial setup

    lookup: {
        minChar: number;
        pageSize: number;
        maxProjectMember?: number;
        maxPdf?: number;
        maxXls?: number;
        maxMp4?: number;
        maxMov?: number;
        maxSizeFile?: number;
        maxSizeMp4?: number;
        maxSizeMov?: number;
        maxProposalSS?: Date;
        minProposalSS?: Date;
        maxProposalQCC?: Date;
        minProposalQCC?: Date;
        maxProposalQCP?: Date;
        minProposalQCP?: Date;
        maxProposalII?: Date;
        minProposalII?: Date;
        attachment?: LookupAttachment[];
    };

    // buat option category
    categoryList: any[] = [
        {value : '', label: '-- Please Select --'}
    ];
    // akhir buat option category

    // temp maxProjectMember
    maxMemberII: number;
    maxMemberQCC: number;
    maxMemberQCP: number;
    // akhir temp maxProjectMember

    uiState: {
        cancelModalIsOpen: boolean
        endDateIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        deleteModalIsOpen: boolean;
        isDeleting: boolean;
        isSaving: boolean;
        processIsPressed: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        deleteSuccessModalIsOpen: boolean,
        saveSuccessModalIsOpen: boolean;
        startDateIsOpen: boolean;
        suggestionLoading: boolean;
        templateIsDownloading: boolean;
        detailIsValid: boolean;
        proposalQCC?: string;
        proposalQCP?: string;
        proposalII?: string;
        proposalSS?: string;
    };

    // buatan obet

    autogrow(idTextArea: string) {
        const textArea = document.getElementById(idTextArea);
        textArea.style.overflow = 'hidden';
        textArea.style.height = '0px';
        textArea.style.height = textArea.scrollHeight + 'px';
    }

    clearData(event) {
        // mengosongkan member
        for (let index = this.memberForms.length; index >= 0; index--) {
            this.memberForms.removeAt(index);
        }

        if (this.thinkwareForm.get('category').value === 'SS') {
            this.placeHolderNamaLeader = 'Nama';
        } else {
            this.placeHolderNamaLeader = 'Nama Team Leader';
        }

        this.categoryM = event;
        this.thinkwareForm.get('leaderName').reset();
        this.thinkwareForm.get('branch').reset();
        this.memberCounter = 0;
        this.thinkwareSuggestions = null;

    }

    toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
      }

    get errorInitialSetup() {
        return this.PIC && this.subkategori && this.maxMember && this.aer;
    }

    get memberForms() {
        return this.thinkwareForm.get('memberForm') as FormArray;
    }

    get departmentIsVisible () {
        if (this.thinkwareForm.get('branch').value !== null) {
            return this.thinkwareForm.get('branch').value.split(' - ')[0] === '00001';
        }
        return false;
    }

    blankTWSuggestion() {
        this.thinkwareSuggestions = null;
    }

    memberTWSuggestion(i) {
        this.thinkwareSuggestions = null;

        this.memberForms.at(i).get('memberName').valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                filter(namaLeader => namaLeader && namaLeader.length >= this.lookup.minChar),
            )
            .subscribe(() => {
                this.suggestionMember[i] = true;
            }
        );

        this.memberForms.at(i).get('memberName').valueChanges
        .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(namaLeader => namaLeader && namaLeader.length >= this.lookup.minChar),
//                concatMap(namaLeader => this.thinkwareSvc.getThinkwareMember(namaLeader, this.branchSave))
                concatMap(namaLeader => this.thinkwareSvc.getThinkwareSuggest
                    (this.isPIC.branchCode, namaLeader))
            )
        .subscribe(thinkwareSuggestions => {
                this.filteredSuggestion(thinkwareSuggestions, i);
                if (thinkwareSuggestions.length > 0) {
                    this.suggestionCheck = thinkwareSuggestions;
                }
                this.suggestionMember[i] = false;
            }
        );

    }

    addMember(bypass?: boolean) {
        if (this.memberCounter < this.lookup.maxProjectMember) {
            const memberForm = this.fb.group({
            memberName: ['', Validators.required],
            memberId: [''],
            memberBranchCode: ['']
            });
            this.suggestionMember.push(false);
            this.memberForms.push(memberForm);
            this.thinkwareSuggestions = null;

            this.memberCounter++;

        } else {

            if (!bypass) {

                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    message: 'Project member maksimal ' + this.lookup.maxProjectMember + ' orang ',
                    type: 'ErrorResponse'
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            }
        }
    }

    // addMemberSpesial() { // untuk add MemberForm jika member yang terdaftar lebih besar dari lookup
    //     const memberForm = this.fb.group({
    //         memberName: ['', Validators.required],
    //         memberId: ['']
    //     });
    //     this.suggestionMember.push(false);
    //     this.memberForms.push(memberForm);
    //     this.thinkwareSuggestions = null;

    //     this.memberCounter++;
    // }

    deleteMember(i) {
        this.memberForms.removeAt(i);
        this.memberCounter--;
    }

    constructor(
        private fb: FormBuilder,
        private ar: ActivatedRoute,
        private thinkwareSvc: ThinkwareService,
        private datepipe: DatePipe,
        private lookupSvc: LookupService,
        private location: Location,
        private authSvc: AuthService
    ) {
        this.currentDateTime = interval(1000).pipe(map(() => moment()));

        this.toolTipII = null;
        this.toolTipQCC = null;
        this.toolTipQCP = null;
        this.toolTipSS = null;

        this.IIEmit = fb.group({
            categoryII: ['', Validators.required],
            businessCase: ['', Validators.required],
            description: ['', Validators.required],
            costAndBenefit: ['', Validators.required]
        });

        this.QCCEmit = fb.group({
            categoryQCC: [''],
            problem: ['', Validators.required],
            goalStatement: ['', Validators.required],
            projectScope: ['', Validators.required],
            processMapping: ['', Validators.required],
            performanceMapping: ['', Validators.required],
            causeAnalysis: ['', Validators.required],
            alternativeSolution: ['', Validators.required],
            solution: ['', Validators.required],
            solutionDescription: ['', Validators.required]
        });

        this.QCPEmit = fb.group({
            categoryQCP: [''],
            problem: ['', Validators.required],
            goalStatement: ['', Validators.required],
            projectScope: ['', Validators.required],
            processMapping: ['', Validators.required],
            performanceMapping: ['', Validators.required],
            causeAnalysis: ['', Validators.required],
            alternativeSolution: ['', Validators.required],
            solution: ['', Validators.required],
            solutionDescription: ['', Validators.required]
        });

        this.SSEmit = fb.group({
            cause: ['', Validators.required],
            problem: ['', Validators.required],
            solution: ['', Validators.required],
        });

        this.attachmentEmit = fb.group({
        });

        this.attachmentLebihEmit = fb.group({
        });

        this.existAttachment = fb.group({
            resultPdf: [''],
            resultXls: [''],
            resultMp4: [''],
            resultMov: [''],
            folder: ['']
        });

        this.thinkwareForm = fb.group({
            title: ['', Validators.required],
            codeProject: {value: '', disabled: true},
            department1: {value: '', disabled: true},
            department2: {value: '', disabled: true},
            supervisor1: {value: '', disabled: true},
            supervisor2: {value: '', disabled: true},
            id: [''],
            leaderName: ['', Validators.required],
            branch: [{value: '', disabled: true}, Validators.required],
            category: {value: this.categoryList[0].value, disabled: true},
            memberForm: this.fb.array([])
        });

        this.uiState = {
            cancelModalIsOpen: false,
            endDateIsOpen: false,
            deleteSuccessModalIsOpen: false,
            failedRecordIsDownloading: false,
            isDeleting: false,
            isSaving: false,
            processIsPressed: false,
            deleteModalIsOpen: false,
            saveIsPressed: false,
            suggestionLoading: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            startDateIsOpen: false,
            templateIsDownloading: false,
            detailIsValid: false
        };

        this.lookup = {
            minChar: 2,
            pageSize: 20,
            maxProjectMember: Number.POSITIVE_INFINITY
        };

        this.tipeEmit = {};

    }

    ngOnInit() {

        this.initialSetup();

        this.thinkwareSvc.getToolTipII()
        .subscribe((toolTipII) => {
            this.toolTipII = toolTipII;
        });

        this.thinkwareSvc.getToolTipQCC()
        .subscribe((toolTipQCC) => {
            this.toolTipQCC = toolTipQCC;
        });

        this.thinkwareSvc.getToolTipQCP()
        .subscribe((toolTipQCP) => {
            this.toolTipQCP = toolTipQCP;
        });

        this.thinkwareSvc.getToolTipSS()
        .subscribe((toolTipSS) => {
            this.toolTipSS = toolTipSS;
        });

        // mengambil kategori
        this.lookupSvc.getLookupDetailList('THINKWARE_KATEGORI')
            .subscribe((fullData) => {
                for (let index = 0; index < fullData.dataList.length; index++) {
                    if (fullData.dataList[index].active) {
                        const category = {
                            value: fullData.dataList[index].meaning,
                            label: fullData.dataList[index].description
                        };
                        this.categoryList.push(category);
                    }
                }
            });

        this.thinkwareForm.get('leaderName').valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                filter(namaLeader => namaLeader && namaLeader.length >= this.lookup.minChar),
            )
            .subscribe(() => {
                this.uiState.suggestionLoading = true;
            });

        this.thinkwareForm.get('leaderName').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(namaLeader => namaLeader && namaLeader.length >= this.lookup.minChar),
                concatMap(namaLeader => this.thinkwareSvc.getThinkwareSuggest
                    (this.isPIC.branchCode, namaLeader))
            )
            .subscribe(thinkwareSuggestions => {
                this.filteredSuggestion(thinkwareSuggestions);
                if (thinkwareSuggestions.length !== 0) {
                    this.suggestionCheck = thinkwareSuggestions;
                }
                this.uiState.suggestionLoading = false;
            });

        this.thinkwareForm.get('department1').valueChanges
            .pipe(
                debounceTime(500),
            )
            .subscribe( () => {
                if (document.getElementById('level1')) {
                    this.autogrow('level1');
                    this.autogrow('level2');
                }
            }
        );
    }

      // ambil data dari lookup berdasarkan nama
      // mengubah data meaning dari dd-mm-yy ke mm/dd/yyyy
      meaningMap(dataList: any[], name: string) {
        for (let index = 0; index < dataList.length; index++) {
            if (dataList[index].detailCode === name) {
                const str = dataList[index].meaning.split('-');
                const dd = str[0];
                const mm = str[1];
                const yy = str[2];
                return mm + '/' + dd + '/' + yy;
                // dd-mm-yyyy -> mm/dd/yyyy
                }
            }
        }

    leaderTerpilih(event) {
        this.thinkwareForm.get('leaderName').setValue(event.option.value.username + ' - ' + event.option.value.fullName);
        // this.thinkwareForm.get('department1').setValue(event.option.value.dept1);
        // this.thinkwareSvc.getDept2(event.option.value.username, '0' + event.option.value.compId)
        // .subscribe((hasilDept) => {
        //     this.thinkwareForm.get('department2').setValue(hasilDept.spv1Org.orgName);
        // });
    }

    memberTerpilih(event, i) {
        this.memberForms.at(i).get('memberName').setValue(event.option.value.username + ' - ' + event.option.value.fullName);
        this.memberForms.at(i).get('memberBranchCode').setValue(event.option.value.branchCode);
    }

    initialSetup(): void {

        this.now.setHours(0);
        this.now.setMilliseconds(0);
        this.now.setMinutes(0);
        this.now.setSeconds(0);

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MAX_ROW')
        )
            .subscribe(
                ([minChar, pageSize]) => {
                    this.lookup = {minChar, pageSize};

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

        this.thinkwareSvc.getIsPIC(this.authSvc.getAuth.username)
            .subscribe((isPic) => {
            this.isPIC = isPic;

            this.PIC = true;
            }, error => {
                this.PIC = false;
            }
        );

        // mengambil data subkategory
        this.lookupSvc.getLookupDetailList('THINKWARE_SUBKATEGORI')
            .subscribe((fullData) => {
                for (let index = 0; index < fullData.dataList.length; index++) {
                    const subCategory = {
                        active : fullData.dataList[index].active,
                        value : fullData.dataList[index].meaning,
                        label : fullData.dataList[index].description
                    };
                    if (fullData.dataList[index].id.indexOf('_II_') >= 0) {
                        this.IISubCategory.push(subCategory);
                    } else if (fullData.dataList[index].id.indexOf('_QCP_') >= 0) {
                        this.QCPSubCategory.push(subCategory);
                    } else if (fullData.dataList[index].id.indexOf('_QCC_') >= 0) {
                        this.QCCSubCategory.push(subCategory);
                    }
                }

                this.subkategori = true;

            }, error => {
                this.subkategori = false;
            }
        );

        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_II').subscribe((fullData) => {
            const minProposalII = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_II'));
            const maxProposalII = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_II'));
            const minRisalahII = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_II'));
            const maxRisalahII = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_II'));

            if (this.now >= minProposalII && this.now <= maxProposalII) {
                this.checkII = 'Edit Proposal';
                this.uiState.proposalII = 'true';
            } else if (this.now >= minRisalahII && this.now <= maxRisalahII) {
                this.checkII = 'Risalah';
                this.uiState.proposalII = 'false';
            }

        });
        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_SS').subscribe((fullData) => {
            const minProposalSS = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_SS'));
            const maxProposalSS = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_SS'));
            const minRisalahSS = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_SS'));
            const maxRisalahSS = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_SS'));

            if (this.now >= minProposalSS && this.now <= maxProposalSS) {
                this.checkSS = 'Edit Proposal';
                this.uiState.proposalSS = 'true';
            } else if (this.now >= minRisalahSS && this.now <= maxRisalahSS) {
                this.checkSS = 'Risalah';
                this.uiState.proposalSS = 'false';
            }
        });
        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_QCC').subscribe((fullData) => {
            const minProposalQCC = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_QCC'));
            const maxProposalQCC = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_QCC'));
            const minRisalahQCC = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_QCC'));
            const maxRisalahQCC = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_QCC'));

            if (this.now >= minProposalQCC && this.now <= maxProposalQCC) {
                this.checkQCC = 'Edit Proposal';
                this.uiState.proposalQCC = 'true';
            } else if (this.now >= minRisalahQCC && this.now <= maxRisalahQCC) {
                this.checkQCC = 'Risalah';
                this.uiState.proposalQCC = 'false';
            }


        });
        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_QCP').subscribe((fullData) => {
            const minProposalQCP = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_QCP'));
            const maxProposalQCP = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_QCP'));
            const minRisalahQCP = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_QCP'));
            const maxRisalahQCP = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_QCP'));

            if (this.now >= minProposalQCP && this.now <= maxProposalQCP) {
                this.checkQCP = 'Edit Proposal';
                this.uiState.proposalQCP = 'true';
            } else if (this.now >= minRisalahQCP && this.now <= maxRisalahQCP) {
                this.checkQCP = 'Risalah';
                this.uiState.proposalQCP = 'false';
            }
        });

        this.ar.params
        .pipe(concatMap(params => this.thinkwareSvc.getThinkwareId(params.id)))
        .subscribe(thinkw => {this.thinkw = thinkw;
            this.thinkwareForm.patchValue(thinkw);
            this.thinkwareForm.get('leaderName').setValue(thinkw.leaderNpk + ' - ' + thinkw.leaderName);
            this.thinkwareForm.get('department1').setValue(thinkw.department1);
            this.thinkwareForm.get('department2').setValue(thinkw.department2);
            this.thinkwareForm.get('supervisor1').setValue(thinkw.supervisor1);
            this.thinkwareForm.get('supervisor2').setValue(thinkw.supervisor2);
            const branchlist = [];
            branchlist.push(thinkw.branch);
            this.thinkwareSvc.getBranchName(branchlist)
            .subscribe(branchName => {
                let branchId = '';
                if (thinkw.branch === 'HEADOFFICE') {
                    branchId = '00001';
                    this.thinkwareForm.get('branch').setValue(branchId + ' - ' + branchName[0].nama);
                } else {
                    this.thinkwareSvc.getGlCode(branchlist).subscribe(glcode => {
                    this.thinkwareForm.get('branch').setValue(glcode.glCode + ' - ' + branchName[0].nama);
                    });
                }
            }
            );

            this.branchSave = thinkw.branch;
            this.categoryM = thinkw.category;
            this.idExist = thinkw.id;
            this.idMemberQCC = thinkw.detailQCC ? thinkw.detailQCC.id : '';
            this.idMemberQCP = thinkw.detailQCP ? thinkw.detailQCP.id : '';
            this.idMemberSS = thinkw.detailSS ? thinkw.detailSS.id : '';
            this.idMemberII = thinkw.detailII ? thinkw.detailII.id : '';
            this.detailmembers = thinkw.detailsMember;

            switch (this.thinkw.category) {
                case 'SS':
                    this.checkEdit = this.checkSS;
                    break;
                case 'QCP':
                    this.checkEdit = this.checkQCP;
                    break;
                case 'QCC':
                    this.checkEdit = this.checkQCC;
                    break;
                case 'II':
                    this.checkEdit = this.checkII;
                    break;
            }

            let attachments;
            switch (this.categoryM) {
                case 'II' :
            this.IIEmit.patchValue(thinkw.detailII);
            this.thinkw.detailQCC = null;
            this.thinkw.detailQCP = null;
            this.thinkw.detailSS = null;
            if (this.checkEdit === 'Risalah') {
                this.thinkwareForm.get('title').disable();
            }
            attachments = thinkw.detailII.attachment;
                break;
                case 'SS' :
            this.SSEmit.patchValue(thinkw.detailSS);
            this.thinkw.detailII = null;
            this.thinkw.detailQCP = null;
            this.thinkw.detailQCC = null;
            if (this.checkEdit === 'Risalah') {
                this.thinkwareForm.get('title').disable();
            }
            attachments = thinkw.detailSS.attachment;
                break;
                case 'QCP' :
            this.QCPEmit.patchValue(thinkw.detailQCP);
            this.thinkw.detailII = null;
            this.thinkw.detailSS = null;
            this.thinkw.detailQCC = null;
            if (this.checkEdit === 'Risalah') {
                this.thinkwareForm.get('title').disable();
            }
            attachments = thinkw.detailQCP.attachment;
                break;
                case 'QCC' :
            this.QCCEmit.patchValue(thinkw.detailQCC);
            this.thinkw.detailQCP = null;
            this.thinkw.detailII = null;
            this.thinkw.detailSS = null;
            if (this.checkEdit === 'Risalah') {
                this.thinkwareForm.get('title').disable();
            }
            attachments = thinkw.detailQCC.attachment;
                break;
            }

            // isi existing attachment
            const resultPdf = [];
            const resultXls = [];
            const resultMp4 = [];
            const resultMov = [];

            for (let index = 0; index < attachments.length; index++) {
                const tambah =  REGEX_FILE_NAME.exec(attachments[index].fullPath)[0];
                const split = attachments[index].fullPath.split('/');
                this.existAttachment.folder = split[split.length - 2];
                const full = attachments[index].fullPath;
                const checkType = attachments[index].type;

                switch (checkType) {
                  case 'pdf':
                    resultPdf.push(tambah);
                    break;
                  case 'xls':
                    resultXls.push(tambah);
                    break;
                  case 'mov':
                    resultMov.push(tambah);
                    break;
                  case 'mp4':
                    resultMp4.push(tambah);
                    break;
                }
            }
            this.existAttachment.resultPdf = resultPdf;
            this.existAttachment.resultXls = resultXls;
            this.existAttachment.resultMp4 = resultMp4;
            this.existAttachment.resultMov = resultMov;

            // mengambil max member
            this.lookupSvc.getLookupDetailList('THINKWARE_PROJECTMEMBER')
                .subscribe((fullData) => {
                let maxMemberII = Number.POSITIVE_INFINITY;
                let maxMemberQCC = Number.POSITIVE_INFINITY;
                let maxMemberQCP = Number.POSITIVE_INFINITY;
                for (let index = 0; index < fullData.dataList.length; index++) {
                    if (fullData.dataList[index].detailCode === 'PROJECT_MEMBER_II') {
                    maxMemberII = parseInt(fullData.dataList[index].meaning, 10);
                    }
                    if (fullData.dataList[index].detailCode === 'PROJECT_MEMBER_QCC') {
                        maxMemberQCC = parseInt(fullData.dataList[index].meaning, 10);
                    }
                    if (fullData.dataList[index].detailCode === 'PROJECT_MEMBER_QCP') {
                        maxMemberQCP = parseInt(fullData.dataList[index].meaning, 10);
                    }
                }
                this.maxMemberII = maxMemberII;
                this.maxMemberQCC = maxMemberQCC;
                this.maxMemberQCP = maxMemberQCP;

                switch (this.thinkw.category) {
                    case 'QCP':
                        this.lookup.maxProjectMember = this.maxMemberQCP;
                    break;
                    case 'QCC':
                        this.lookup.maxProjectMember = this.maxMemberQCC;
                    break;
                    case 'II':
                        this.lookup.maxProjectMember = this.maxMemberII;
                    break;
                }

                    if (this.lookup.maxProjectMember !== 0) {
                        for (let index = 0; index < this.detailmembers.length; index++) {
                            if (this.lookup.maxProjectMember > index) {
                                this.addMember(true);
                                this.memberForms.at(index).get('memberName').setValue
                                (thinkw.detailsMember[index].memberNpk + ' - ' + thinkw.detailsMember[index].memberName);
                                if (thinkw.detailsMember[index].id) {
                                    this.memberForms.at(index).get('memberId').setValue(thinkw.detailsMember[index].id);
                                } else {
                                    this.memberForms.at(index).get('memberId').setValue('');
                                }
                                if (thinkw.detailsMember[index].id) {
                                  this.memberForms.at(index).get('memberBranchCode').setValue(thinkw.detailsMember[index].memberBranchCode);
                                } else {
                                    this.memberForms.at(index).get('memberBranchCode').setValue('');
                                }
                            }
                        }
                    }
                    this.maxMember = true;
                }, error => {
                    this.maxMember = false;
                }
            );
            this.aer = true;
        }, error => {
            this.aer =  false;
        });
    }

    filteredSuggestion(thinkwareSuggestions, indexMember2Ignore?) {
        // set filter dari form
        const filterNpk = [];
        if (this.thinkwareForm.get('leaderName').value !== '' && this.thinkwareForm.get('leaderName').value !== null) {
            if (this.thinkwareForm.get('leaderName').value.indexOf('-') >= 0) {
                filterNpk.push(this.thinkwareForm.get('leaderName').value.split(' - ')[0]);
            }
        }

        for (let index = 0; index < this.memberForms.length; index++) {
            if (indexMember2Ignore !== null) {
                if (index !== indexMember2Ignore) {
                    filterNpk.push(this.memberForms.at(index).get('memberName').value.split(' - ')[0]);
                }
            } else {
                filterNpk.push(this.memberForms.at(index).get('memberName').value.split(' - ')[0]);
            }
        }

        this.thinkwareSuggestions = thinkwareSuggestions;
        if (this.thinkwareSuggestions !== null) {
            for (let index = 0; index < this.thinkwareSuggestions.length; index++) {
                for (let idxFilter = 0; idxFilter < filterNpk.length; idxFilter++) {
                    if (this.thinkwareSuggestions.length !== 0) {
                        if (this.thinkwareSuggestions[index].username === filterNpk[idxFilter]) {
                            this.thinkwareSuggestions.splice(index, 1);
                            if (index > 0) {
                                index--;
                            }
                        }
                    }
                }
            }
        }
    }

    openDeleteModal(evt: Event): void {

        evt.preventDefault();

        this.uiState.deleteModalIsOpen = true;

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.thinkwareForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }

    invalidFieldMember(index: number, control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.memberForms.at(index).get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.thinkwareForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async resetIfNotInSuggestion(control: string, posisi: string, indexMember?: number) {
        await this.delay(700);
        let a = null;
        if (posisi === 'leader') {
            a = this.thinkwareForm.get(control).value;
        } else {
            a = this.memberForms.at(indexMember).get(control).value;
        }
        let npknya = '';
        let fullnamenya = '';
        if (a.indexOf(' - ') >= 0) {
            npknya = a.split(' - ')[0];
            fullnamenya = a.split(' - ')[1];
        }

        if (posisi === 'leader') {
            this.thinkwareSvc.getThinkwareSuggest(this.isPIC.branchCode, npknya)
            .subscribe((suggest) => {

                if (suggest.length === 1) {
                    if (npknya !== suggest[0].username || fullnamenya !== suggest[0].fullName) {
                        this.thinkwareForm.get(control).setValue('');
                    }
                } else if (suggest.length > 1) {
                    let hapus = true;
                    for (let index = 0; index < suggest.length; index++) {
                        if (npknya === suggest[index].username || fullnamenya === suggest[index].fullName) {
                            hapus = false;
                        }
                    }

                    if (hapus) {
                            this.thinkwareForm.get(control).setValue('');
                    }
                }
            }, error => {
                this.thinkwareForm.get(control).setValue('');
            });
        } else {
            this.thinkwareSvc.getThinkwareSuggest(this.isPIC.branchCode, npknya)
            .subscribe((suggest) => {

                if (suggest.length === 1) {
                    if (npknya !== suggest[0].username || fullnamenya !== suggest[0].fullName) {
                        this.memberForms.at(indexMember).get(control).setValue('');
                        this.memberForms.at(indexMember).get('memberBranchCode').setValue('');
                    }
                } else if (suggest.length > 1) {
                    let hapus = true;
                    for (let index = 0; index < suggest.length; index++) {
                        if (npknya === suggest[index].username || fullnamenya === suggest[index].fullName) {
                            hapus = false;
                        }
                    }

                    if (hapus) {
                            this.memberForms.at(indexMember).get(control).setValue('');
                            this.memberForms.at(indexMember).get('memberBranchCode').setValue('');
                    }
                }
            }, error => {
                this.memberForms.at(indexMember).get(control).setValue('');
                this.memberForms.at(indexMember).get('memberBranchCode').setValue('');
            });
        }

        this.thinkwareSuggestions = null;
    }

    checkFormValidity(evt?: Event): void {

        evt.preventDefault();

        // check PIC
        let PICState = false;
        if (this.isPIC.npk === this.thinkwareForm.get('leaderName').value.split(' - ')[0]) {
            PICState = true;
        }

        for (let index = 0; index < this.memberForms.length; index++) {
            if (this.isPIC.npk === this.memberForms.at(index).get('memberName').value.split(' - ')[0]) {
                PICState = PICState || true;
            }
        }

        if (this.isPIC.pic) {
            PICState = true;
        }
        // akhir check PIC

        // check detail

        switch (this.thinkwareForm.get('category').value) {
            case 'SS' :
                this.SSEmit.enable();
                this.QCPEmit.reset();
                this.QCCEmit.reset();
                this.IIEmit.reset();
                this.uiState.detailIsValid = this.SSEmit.valid;
            break;
            case 'QCP' :
                this.QCPEmit.enable();
                this.QCCEmit.reset();
                this.IIEmit.reset();
                this.uiState.detailIsValid = this.QCPEmit.valid;
            break;
            case 'QCC' :
                this.QCCEmit.enable();
                this.QCPEmit.reset();
                this.IIEmit.reset();
                this.uiState.detailIsValid = this.QCCEmit.valid;
            break;
            case 'II' :
                this.IIEmit.enable();
                this.QCCEmit.reset();
                this.QCPEmit.reset();
                this.uiState.detailIsValid = this.IIEmit.valid;
            break;
            case '' :
                this.uiState.detailIsValid = false;
            break;
        }

        // cek leader dan member tidak sama

       let isFieldIdentic = false;

       for (let index = 0; index < this.memberForms.length; index++) {

           if (this.thinkwareForm.get('leaderName').value.split(' - ')[0] ===
           this.memberForms.at(index).get('memberName').value.split(' - ')[0]) {

               isFieldIdentic = true;

               break;

           }

       }

       if (!isFieldIdentic && this.memberForms.length > 0) {

           for (let index = 0; index < this.memberForms.length - 1; index++) {

               for (let index1 = index + 1; index1 < this.memberForms.length; index1++) {

                   if (this.memberForms.at(index).get('memberName').value.split(' - ')[0] ===
                   this.memberForms.at(index1).get('memberName').value.split(' - ')[0]) {

                       isFieldIdentic = true;

                   }

               }

           }

        }
        // akhir leader dan member tidak sama

        // cek file PDF
        let pdfIsNull = true;
        let adaPdf: Boolean = false;
        if (this.tipeEmit !== {}) {
            for (let index = 0; index < this.tipeEmit.length; index++) {
                if (this.tipeEmit[index] === 'pdf') {
                    adaPdf = true;
                }
            }
        }
        if (!adaPdf) {
            pdfIsNull = false;
        } else {
        if (this.checkEdit === 'Risalah') {
            const pdf = this.attachmentEmit.get('attachmentPdf').value ? this.attachmentEmit.get('attachmentPdf').value : [];
            let pdfIsNullFile = true;
            for (let index = 0; index < pdf.length; index++) {
                if (pdf[index].file !== null) {
                    pdfIsNullFile = pdfIsNullFile && pdf[index].file.size === undefined;
                }
            }
            const attach = this.existAttachment.resultAttachment as FormGroup;
            const exist = attach.get('existAttachmentPdf').value ? attach.get('existAttachmentPdf').value : [];
            let pdfIsNullAttachment = true;
            for (let index = 0; index < exist.length; index++) {
                pdfIsNullAttachment = pdfIsNullAttachment && exist[index] === null;
            }
            pdfIsNull = pdfIsNullFile.valueOf() && pdfIsNullAttachment.valueOf();
        } else {
            pdfIsNull = false;
        }
    }
        // akhir cek file PDF

        // cek apakah attachment melebihi lookup
        const msgIfAttachLebih = [];
        let isAttachLebih: Boolean = false;
        for (let index = 0; index < this.attachmentLebihEmit.length; index++) {
            const isLebih: Boolean = this.attachmentLebihEmit[index].isLebih;
            isAttachLebih = isAttachLebih || isLebih;
            if (this.attachmentLebihEmit[index].isLebih) {
                msgIfAttachLebih.push(this.attachmentLebihEmit[index].jenis);
            }
        }
        // akhir cek apakah attachment melebihi lookup

        this.uiState.saveIsPressed = true;

        if ((!this.thinkwareForm.valid || !this.IIEmit.valid ) && this.categoryM === 'II') {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else if ((!this.thinkwareForm.valid || !this.SSEmit.valid ) && this.categoryM === 'SS') {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else if ((!this.thinkwareForm.valid || !this.QCPEmit.valid ) && this.categoryM === 'QCP') {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else if ((!this.thinkwareForm.valid || !this.QCCEmit.valid ) && this.categoryM === 'QCC') {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else if (!PICState) {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Tidak dapat edit proposal karena anda tidak terdaftar sebagai PIC',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else if (isFieldIdentic) {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Terdapat Orang yang sama',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else if (this.memberForms.length === 0 && this.lookup.maxProjectMember !== 0
                && this.lookup.maxProjectMember !== Number.POSITIVE_INFINITY
                && this.thinkwareForm.get('category').value !== 'SS') {
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else if (this.thinkwareForm.valid && this.uiState.detailIsValid && !pdfIsNull && this.attachmentEmit.valid && !isAttachLebih) {
            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

            // menghilangkan alert ketika form telah valid
            this.responseOnAction = null;

        } else if (this.thinkwareForm.get('category').value === '') {
            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Kategori harus dipilih terlebih dahulu',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else if (this.memberForms.length > 0 && this.lookup.maxProjectMember !== Number.POSITIVE_INFINITY && !this.memberForms.valid) {
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
    } else {
            switch (this.thinkwareForm.get('category').value) {
                case 'SS' :
                if (pdfIsNull) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Setidaknya harus terdapat 1 file PDF',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else if (!this.attachmentEmit.valid) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Attachment tidak valid',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else {
                    if (isAttachLebih) { // jika terdapat attachment yang jumlahnya melebihi lookup
                        this.responseOnAction = {
                            ...{} as ErrorResponse,
                            message: 'Hapus attachment dari ' + msgIfAttachLebih.toString() + ' karena melebihi dari jumlah maksimal',
                            type: 'ErrorResponse'
                        };

                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    } else {
                        this.responseOnAction = {
                            ...{} as ErrorResponse,
                            message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                            type: 'ErrorResponse'
                        };
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                }
                break;

                case 'QCC' :
                if (this.QCCSubCategory.length > 0 &&
                (this.QCCEmit.get('categoryQCC').value === null || this.QCCEmit.get('categoryQCC').value === '')) {
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else if (pdfIsNull) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Setidaknya harus terdapat 1 file PDF',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else if (!this.attachmentEmit.valid) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Attachment tidak valid',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else {
                    if (isAttachLebih) { // jika terdapat attachment yang jumlahnya melebihi lookup
                        this.responseOnAction = {
                            ...{} as ErrorResponse,
                            message: 'Hapus attachment dari ' + msgIfAttachLebih.toString() + ' karena melebihi dari jumlah maksimal',
                            type: 'ErrorResponse'
                        };

                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    } else {
                        this.responseOnAction = {
                            ...{} as ErrorResponse,
                            message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                            type: 'ErrorResponse'
                        };

                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                }
                break;

                case 'QCP' :
                if (this.QCPSubCategory.length > 0 &&
                    (this.QCPEmit.get('categoryQCP').value === null || this.QCPEmit.get('categoryQCP').value === '')) {
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else if (pdfIsNull) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Setidaknya harus terdapat 1 file PDF',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else if (!this.attachmentEmit.valid) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Attachment tidak valid',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else {
                    if (isAttachLebih) { // jika terdapat attachment yang jumlahnya melebihi lookup
                        this.responseOnAction = {
                            ...{} as ErrorResponse,
                            message: 'Hapus attachment dari ' + msgIfAttachLebih.toString() + ' karena melebihi dari jumlah maksimal',
                            type: 'ErrorResponse'
                        };

                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    } else {
                        this.responseOnAction = {
                            ...{} as ErrorResponse,
                            message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                            type: 'ErrorResponse'
                        };

                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                }
                break;
                case 'II' :
                if (this.IISubCategory.length > 1 &&
                    (this.IIEmit.get('categoryII').value === null || this.IIEmit.get('categoryII').value === '')) {
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else if (pdfIsNull) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Setidaknya harus terdapat 1 file PDF',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else if (!this.attachmentEmit.valid) {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Attachment tidak valid',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else {
                    if (isAttachLebih) { // jika terdapat attachment yang jumlahnya melebihi lookup
                        this.responseOnAction = {
                            ...{} as ErrorResponse,
                            message: 'Hapus attachment dari ' + msgIfAttachLebih.toString() + ' karena melebihi dari jumlah maksimal',
                            type: 'ErrorResponse'
                        };

                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    } else {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                }

            }
        }

        // membuat datail jadi disable jika dalam risalah
        if (this.uiState.proposalSS === 'false') {
            this.SSEmit.disable();
        }
        if (this.uiState.proposalQCC === 'false') {
            this.QCCEmit.disable();
        }
        if (this.uiState.proposalQCP === 'false') {
            this.QCPEmit.disable();
        }
        if (this.uiState.proposalII === 'false') {
            this.IIEmit.disable();
        }
    }

    delete(): void {

        this.uiState.isDeleting = true;

        this.thinkwareSvc.deleteThinkware(this.thinkwareForm.get('id').value)
            .pipe(
                finalize(() => {

                    this.uiState.isDeleting = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                success => {this.responseOnAction = {...success, type: 'GenericResponse'};
                this.uiState.deleteSuccessModalIsOpen = true;
                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

    save(): void {

        this.uiState.isSaving = true;

        const detailII: DetailII = {
            ...this.IIEmit.getRawValue(),
            id: this.idMemberII
        };

        const detailQCC: DetailQCC = {
            ...this.QCCEmit.getRawValue(),
            id: this.idMemberQCC
        };

        const detailQCP: DetailQCP = {
            ...this.QCPEmit.getRawValue(),
            id: this.idMemberQCP
        };

        const detailSS: DetailSS = {
            ...this.SSEmit.getRawValue(),
            id: this.idMemberSS
        };

        const detailMember: DetailMember[] = [];
        for (let index = 0; index < this.memberForms.length; index++) {
            const member4push: DetailMember = {
                active: true,
                memberName: this.memberForms.at(index).get('memberName').value.split(' - ')[1],
                memberNpk: this.memberForms.at(index).get('memberName').value.split(' - ')[0],
                id: this.memberForms.at(index).get('memberId').value ? this.memberForms.at(index).get('memberId').value : '',
                branch: this.memberForms.at(index).get('memberBranchCode').value ?
                    this.memberForms.at(index).get('memberBranchCode').value : ''
            };
            detailMember.push(member4push);
        }

        let status = '';
        if (this.checkEdit === 'Edit Proposal') {
            status = 'PROPOSAL_SUBMITTED';
        } else if (this.checkEdit === 'Risalah') {
            status = 'RISALAH_SUBMITTED';
        }

        const thinkwareSave: ThinkwareSave = {
            branch: this.branchSave,
            category: this.thinkwareForm.get('category').value,
            codeProject: this.thinkwareForm.get('codeProject').value,
            department1: this.thinkwareForm.get('department1').value,
            department2: this.thinkwareForm.get('department2').value,
            detailII: detailII,
            detailSS: detailSS,
            detailQCC: detailQCC,
            detailQCP: detailQCP,
            status: status,
            id: this.idExist,
            detailsMember: detailMember,
            leaderName: this.thinkwareForm.get('leaderName').value.split(' - ')[1],
            leaderNpk: this.thinkwareForm.get('leaderName').value.split(' - ')[0],
            title: this.thinkwareForm.get('title').value.toUpperCase(),
            supervisor1: this.thinkwareForm.get('supervisor1').value,
            supervisor2: this.thinkwareForm.get('supervisor2').value
        };
        if (thinkwareSave.department1 === '') {
            delete thinkwareSave['department1'];
            delete thinkwareSave['department2'];
            delete thinkwareSave['supervisor1'];
            delete thinkwareSave['supervisor2'];
        }

        if (this.checkEdit === 'Risalah') {
        const files = [];
        const types = [];

        for (let indexTipe = 0; indexTipe < this.tipeEmit.length; indexTipe++) { // pdf, xls, mp4 dll;
            // memasukkan array ke array files
            const arrayForm = this.attachmentEmit.get('attachment' + this.toTitleCase(this.tipeEmit[indexTipe])).value;
            for (let index = 0; index < arrayForm.length; index++) {
                if (arrayForm[index].file !== null || arrayForm[index].name) {
                    const forPush = {
                        file: arrayForm[index].file,
                        before: arrayForm[index].name,
                        types: this.tipeEmit[indexTipe]
                    };
                    files.push(forPush);
                    types.push(this.tipeEmit[indexTipe]);
                }
            }
            // akhir memasukkan pada array files
        }

        const existAttachments = this.existAttachment.resultAttachment as FormGroup;
        const exist = [];
        for (let indexTipe = 0; indexTipe < this.tipeEmit.length; indexTipe++) {
            const existAttachment = existAttachments.get('existAttachment' + this.toTitleCase(this.tipeEmit[indexTipe])).value;
            // memasukkan pada array exist
            for (let index = 0; index < existAttachment.length; index++) {
                if (existAttachment[index]) {
                    const forPush = {
                        file: existAttachment[index],
                        types: this.tipeEmit[indexTipe]
                    };
                    exist.push(forPush);
                }
            }
            // akhir memasukkan pada array files
        }

        // jika terdapat exist file
        if (exist.length > 0) {
            if (files.length > 0) {
            this.thinkwareSvc.updateFile(files, this.existAttachment.folder, this.thinkw.codeProject, this.existAttachment.count)
                .subscribe((path) => {
                    const pathBaru = path.split(',');
                    pathBaru[0] = pathBaru[0].replace(API_DOMAIN , '');
                    const attachments: Attachment[] = [];

                    for (let index = 0; index < pathBaru.length - 1; index++) {
                        const fileType = pathBaru[index].split('.');
                        const attachment: Attachment = {
                            fullPath : API_DOMAIN + pathBaru[pathBaru.length - 1] + '/' + pathBaru[index],
                            type : fileType[1]
                        };
                        attachments.push(attachment);
                    }

                if (thinkwareSave.category === 'SS') {
                    delete thinkwareSave['detailQCC'];
                    delete thinkwareSave['detailII'];
                    delete thinkwareSave['detailQCP'];
                    delete thinkwareSave['detailsMember'];
                    thinkwareSave.detailSS.attachment = attachments;
                } else if (thinkwareSave.category === 'QCC') {
                    delete thinkwareSave['detailSS'];
                    delete thinkwareSave['detailII'];
                    delete thinkwareSave['detailQCP'];
                    thinkwareSave.detailQCC.attachment = attachments;
                } else if (thinkwareSave.category === 'QCP') {
                    delete thinkwareSave['detailQCC'];
                    delete thinkwareSave['detailII'];
                    delete thinkwareSave['detailSS'];
                    thinkwareSave.detailQCP.attachment = attachments;
                } else {
                    delete thinkwareSave['detailQCC'];
                    delete thinkwareSave['detailSS'];
                    delete thinkwareSave['detailQCP'];
                    thinkwareSave.detailII.attachment = attachments;
                }

                const saveObs = this.thinkwareSvc.saveThinkware(thinkwareSave).pipe();

                saveObs.pipe(
                    finalize(() => {

                        this.uiState.isSaving = false;
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                    })
                )
                .subscribe(
                    () => this.uiState.saveSuccessModalIsOpen = true,
                    error => this.responseOnAction = {...error, type: 'ErrorResponse'}
                );
            }, error => {
                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    message: 'Silahkan upload kembali',
                    type: 'ErrorResponse'
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            });
        } else {
            if (thinkwareSave.category === 'SS') {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailQCP'];
                delete thinkwareSave['detailsMember'];
                thinkwareSave.detailSS.attachment = null;
            } else if (thinkwareSave.category === 'QCC') {
                delete thinkwareSave['detailSS'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailQCP'];
                thinkwareSave.detailQCC.attachment = null;
            } else if (thinkwareSave.category === 'QCP') {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailSS'];
                thinkwareSave.detailQCP.attachment = null;
            } else {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailSS'];
                delete thinkwareSave['detailQCP'];
                thinkwareSave.detailII.attachment = null;
            }

            const saveObs = this.thinkwareSvc.saveThinkware(thinkwareSave).pipe();

            saveObs.pipe(
                finalize(() => {

                    this.uiState.isSaving = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                () => this.uiState.saveSuccessModalIsOpen = true,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );
        }
    } else {
        if (files.length > 0) {
            this.thinkwareSvc.upload(files, types, this.thinkw.codeProject, this.existAttachment.count)
                .subscribe((path) => {
                    const attachments: Attachment[] = [];

                    for (let index = 0; index < files.length; index++) {
                        if (files[index].file) {
                            let fileType;
                            let ext = '';

                            fileType = files[index].file.name.split('.');
                            ext = fileType[fileType.length - 1];

                            const attachment: Attachment = {
                                fullPath : path + '/' + this.thinkw.codeProject + '-'
                                           + (index + this.existAttachment.count + 1) + '.' + ext,
                                type : ext
                            };
                            attachments.push(attachment);
                        }
                    }
                    console.log(attachments);

                if (thinkwareSave.category === 'SS') {
                    delete thinkwareSave['detailQCC'];
                    delete thinkwareSave['detailII'];
                    delete thinkwareSave['detailQCP'];
                    delete thinkwareSave['detailsMember'];
                    thinkwareSave.detailSS.attachment = attachments;
                } else if (thinkwareSave.category === 'QCC') {
                    delete thinkwareSave['detailSS'];
                    delete thinkwareSave['detailII'];
                    delete thinkwareSave['detailQCP'];
                    thinkwareSave.detailQCC.attachment = attachments;
                } else if (thinkwareSave.category === 'QCP') {
                    delete thinkwareSave['detailQCC'];
                    delete thinkwareSave['detailII'];
                    delete thinkwareSave['detailSS'];
                    thinkwareSave.detailQCP.attachment = attachments;
                } else {
                    delete thinkwareSave['detailQCC'];
                    delete thinkwareSave['detailSS'];
                    delete thinkwareSave['detailQCP'];
                    thinkwareSave.detailII.attachment = attachments;
                }

                const saveObs = this.thinkwareSvc.saveThinkware(thinkwareSave).pipe();

                saveObs.pipe(
                    finalize(() => {

                        this.uiState.isSaving = false;
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                    })
                )
                .subscribe(
                    () => this.uiState.saveSuccessModalIsOpen = true,
                    error => this.responseOnAction = {...error, type: 'ErrorResponse'}
                );
            }, error => {
                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    message: 'Silahkan upload kembali',
                    type: 'ErrorResponse'
                };
            });
        } else {
            if (thinkwareSave.category === 'SS') {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailQCP'];
                delete thinkwareSave['detailsMember'];
            } else if (thinkwareSave.category === 'QCC') {
                delete thinkwareSave['detailSS'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailQCP'];
            } else if (thinkwareSave.category === 'QCP') {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailSS'];
            } else {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailSS'];
                delete thinkwareSave['detailQCP'];
            }

            const saveObs = this.thinkwareSvc.saveThinkware(thinkwareSave).pipe();

            saveObs.pipe(
                finalize(() => {

                    this.uiState.isSaving = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                () => this.uiState.saveSuccessModalIsOpen = true,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );
        }
        }
        } else {
            if (thinkwareSave.category === 'SS') {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailQCP'];
                delete thinkwareSave['detailsMember'];
            } else if (thinkwareSave.category === 'QCC') {
                delete thinkwareSave['detailSS'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailQCP'];
            } else if (thinkwareSave.category === 'QCP') {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailII'];
                delete thinkwareSave['detailSS'];
            } else {
                delete thinkwareSave['detailQCC'];
                delete thinkwareSave['detailSS'];
                delete thinkwareSave['detailQCP'];
            }

            const saveObs = this.thinkwareSvc.saveThinkware(thinkwareSave).pipe();

            saveObs.pipe(
                finalize(() => {

                    this.uiState.isSaving = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                () => this.uiState.saveSuccessModalIsOpen = true,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );
        }
        }

    back(evt: Event): void {

        evt.preventDefault();

        window.history.back();
        // this.location.back();

    }
}
