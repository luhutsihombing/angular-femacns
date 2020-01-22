import {MAT_DATE_FORMATS} from '@angular/material';
import {ThinkwareService} from '../_service/thinkware.service';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {interval, Observable} from 'rxjs';
import {concatMap, debounceTime, distinctUntilChanged, filter, finalize, map} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {ThinkwareSuggestion,
        ThinkwareSave,
        DetailII,
        DetailQCC,
        DetailQCP, DetailSS, DetailMember, IsPIC} from '../_model/thinkware.model';
import * as $ from 'jquery';
import * as moment from 'moment';
import { AuthService } from '../../auth/_service/auth.service';

@Component({
    selector: 'fema-cms-thinkware-create',
    templateUrl: './thinkware-create.component.html',
    styleUrls: ['./thinkware-create.component.scss'],
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

export class ThinkwareCreateComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDateTime: Observable<object>;

    // FormGroup
    thinkwareForm: FormGroup;
    QCCEmit: FormGroup = null;
    QCPEmit: FormGroup = null;
    IIEmit: FormGroup = null;
    SSEmit: FormGroup = null;

    // array
    QCCSubCategory = [];
    QCPSubCategory = [];
    suggestionMember = [];

    // suggestion array
    thinkwareSuggestions: ThinkwareSuggestion[];
    suggestionCheck: ThinkwareSuggestion[];

    isPIC: IsPIC;
    branchSave: string;
    categoryM;
    toolTipII: any;
    toolTipQCC: any;
    toolTipQCP: any;
    toolTipSS: any;
    headOffice: string;
    now = new Date();

    memberCounter = 0;

    placeHolderNamaLeader = 'Nama Team Leader';
    isFieldIdentic = false;

    responseOnAction: ActionResponse;
    errorOnInit: ErrorResponse;

    // jika setup risalah dan proposal ada yang di uncheck
    uncheckSS?: boolean;
    uncheckII?: boolean;
    uncheckQCC?: boolean;
    uncheckQCP?: boolean;

    // temp maxProjectMember
    maxMemberII: number;
    maxMemberQCC: number;
    maxMemberQCP: number;
    // akhir temp maxProjectMember

    // detail Form validity
    QCCFormIsValid = false;
    QCPFormIsValid = false;
    IIFormIsValid = false;
    SSFormIsValid = false;

    lookup: {
        minChar: number;
        pageSize: number;
        maxProjectMember?: number;
        maxSizeFile?: number;
        maxProposalSS?: Date;
        minProposalSS?: Date;
        maxProposalQCC?: Date;
        minProposalQCC?: Date;
        maxProposalQCP?: Date;
        minProposalQCP?: Date;
        maxProposalII?: Date;
        minProposalII?: Date;
        maxRisalahSS?: Date;
        minRisalahSS?: Date;
        maxRisalahQCC?: Date;
        minRisalahQCC?: Date;
        maxRisalahQCP?: Date;
        minRisalahQCP?: Date;
        maxRisalahII?: Date;
        minRisalahII?: Date;
        errorSS?: boolean;
        errorII?: boolean;
        errorQCP?: boolean;
        errorQCC?: boolean;
    };

    categoryList: any[] = [
        {value: '', label: '- - Please Select -'}
    ];

    IISubCategory = [
        {value : '', label: '- Please Select -'}
    ];

    uiState: {
        cancelModalIsOpen: boolean;
        departmentIsVisible: boolean;
        endDateIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        isDeleting: boolean;
        isSaving: boolean;
        processIsPressed: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        startDateIsOpen: boolean;
        suggestionLoading?: boolean;
        templateIsDownloading: boolean;
        detailIsValid: boolean;
        memberBtnIsDisable: boolean;
        proposalSS: boolean;
        proposalQCC: boolean;
        proposalQCP: boolean;
        proposalII: boolean;
    };

    constructor(
        private fb: FormBuilder,
        private thinkwareSvc: ThinkwareService,
        private lookupSvc: LookupService,
        private authSvc: AuthService

    ) {
        this.toolTipII = null;
        this.toolTipQCC = null;
        this.toolTipQCP = null;
        this.toolTipSS = null;

        this.uncheckII = false;
        this.uncheckSS = false;
        this.uncheckQCC = false;
        this.uncheckQCP = false;

        this.currentDateTime = interval(1000).pipe(map(() => moment()));

        this.IIEmit = fb.group({
            categoryII: [''],
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

        this.thinkwareForm = fb.group({
            title: ['', Validators.required],
            leaderName: ['', Validators.required],
            branch: [{value: '', disabled: true}, Validators.required],
            department1: {value: '', disabled: true},
            department2: {value: '', disabled: true},
            supervisor1: {value: '', disabled: true},
            supervisor2: {value: '', disabled: true},
            category: this.categoryList[0].value,
            memberForm: this.fb.array([])
        });

        this.uiState = {
            cancelModalIsOpen: false,
            departmentIsVisible: false,
            endDateIsOpen: false,
            failedRecordIsDownloading: false,
            isDeleting: false,
            isSaving: false,
            processIsPressed: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            startDateIsOpen: false,
            suggestionLoading: false,
            templateIsDownloading: false,
            detailIsValid: false,
            memberBtnIsDisable: false,
            proposalSS: false,
            proposalQCC: false,
            proposalQCP: false,
            proposalII: false // tidak dalam jangka pembuatan proposal
        };

        this.lookup = {
            minChar: 2,
            pageSize: 20,
            maxProjectMember: Number.POSITIVE_INFINITY
        };

        this.thinkwareSuggestions = null;
        this.suggestionCheck = null;

    }

    ngOnInit() {

        this.initialSetup();

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

        }

        );

        // mengambuk kategori
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
        // mengambil data subkategory
        this.lookupSvc.getLookupDetailList('THINKWARE_SUBKATEGORI')
            .subscribe((fullData) => {
                for (let index = 0; index < fullData.dataList.length; index++) {
                    if (fullData.dataList[index].active) {
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
                }
            }
        );

        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_II').subscribe((fullData) => {
            this.lookup.minProposalII = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_II'));
            this.lookup.maxProposalII = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_II'));
            this.lookup.minRisalahII = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_II'));
            this.lookup.maxRisalahII = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_II'));

            if (isNaN(this.lookup.minProposalII.getTime())  || isNaN(this.lookup.maxProposalII.getTime()) ||
            isNaN(this.lookup.minRisalahII.getTime())  || isNaN(this.lookup.maxRisalahII.getTime())) {
                this.uncheckII = true;
            } else {
                if (this.lookup.minProposalII > this.lookup.maxProposalII) {
                    this.lookup.errorII = true;
                } else {
                    this.lookup.errorII = false;
                }
            }

            if (this.now >= this.lookup.minProposalII && this.now <= this.lookup.maxProposalII) {
                this.uiState.proposalII = true;
            } else {
                this.uiState.proposalII = false;
            }
        });

        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_SS').subscribe((fullData) => {
            this.lookup.minProposalSS = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_SS'));
            this.lookup.maxProposalSS = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_SS'));
            this.lookup.minRisalahSS = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_SS'));
            this.lookup.maxRisalahSS = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_SS'));

            if (isNaN(this.lookup.minProposalSS.getTime()) || isNaN(this.lookup.maxProposalSS.getTime()) ||
            isNaN(this.lookup.minRisalahSS.getTime()) || isNaN(this.lookup.maxRisalahSS.getTime())) {
                this.uncheckSS = true;
            } else {
                if (this.lookup.minProposalSS > this.lookup.maxProposalSS) {
                    this.lookup.errorSS = true;
                } else {
                    this.lookup.errorSS = false;
                }
            }

            if (this.now >= this.lookup.minProposalSS && this.now <= this.lookup.maxProposalSS) {
                this.uiState.proposalSS = true;
            } else {
                this.uiState.proposalSS = false;
            }
        });

        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_QCC').subscribe((fullData) => {
            this.lookup.minProposalQCC = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_QCC'));
            this.lookup.maxProposalQCC = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_QCC'));
            this.lookup.minRisalahQCC = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_QCC'));
            this.lookup.maxRisalahQCC = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_QCC'));

            if (isNaN(this.lookup.minProposalQCC.getTime()) || isNaN(this.lookup.maxProposalQCC.getTime()) ||
            isNaN(this.lookup.minRisalahQCC.getTime()) || isNaN(this.lookup.maxRisalahQCC.getTime())) {
                this.uncheckQCC = true;
            } else {
                if (this.lookup.minProposalQCC > this.lookup.maxProposalQCC) {
                    this.lookup.errorQCC = true;
                } else {
                    this.lookup.errorQCC = false;
                }
            }

            if (this.now >= this.lookup.minProposalQCC && this.now <= this.lookup.maxProposalQCC) {
                this.uiState.proposalQCC = true;
            } else {
                this.uiState.proposalQCC = false;
            }

        });

        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_QCP').subscribe((fullData) => {
            this.lookup.minProposalQCP = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_QCP'));
            this.lookup.maxProposalQCP = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_QCP'));
            this.lookup.minRisalahQCP = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_QCP'));
            this.lookup.maxRisalahQCP = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_QCP'));

            if (isNaN(this.lookup.minProposalQCP.getTime()) || isNaN(this.lookup.maxProposalQCP.getTime()) ||
            isNaN(this.lookup.minRisalahQCP.getTime()) || isNaN(this.lookup.maxRisalahQCP.getTime())) {
                this.uncheckQCP = true;
            } else {
                if (this.lookup.minProposalQCP > this.lookup.maxProposalQCP) {
                    this.lookup.errorQCP = true;
                } else {
                    this.lookup.errorQCP = false;
                }
            }

            if (this.now >= this.lookup.minProposalQCP && this.now <= this.lookup.maxProposalQCP) {
                this.uiState.proposalQCP = true;
            } else {
                this.uiState.proposalQCP = false;
            }

        });

        this.thinkwareForm.get('leaderName').valueChanges.subscribe(() => {
            if (this.thinkwareForm.get('leaderName').value === '') {
                this.thinkwareForm.get('branch').setValue('');
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
            }
        );

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
                if (thinkwareSuggestions.length > 0) {
                    this.suggestionCheck = thinkwareSuggestions;
                }
                this.uiState.suggestionLoading = false;
            }
        );

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

    // =========================== Member ++==============================
    addMember() {
        if (this.memberCounter < this.lookup.maxProjectMember) {
            const memberForm = this.fb.group({
            memberName: ['', Validators.required],
            memberBranchCode: ['']
            });
            this.suggestionMember.push(false);
            this.memberForms.push(memberForm);
            this.thinkwareSuggestions = null;

            this.memberCounter++;

        } else {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'Project member maksimal ' + this.lookup.maxProjectMember + ' orang',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        }
    }

    deleteMember(i) {
        this.memberForms.removeAt(i);
        this.memberCounter--;
    }

    // =========================== Akhir Member ++==============================

    get departmentIsVisible () {
        if (this.thinkwareForm.get('branch').value !== null) {
            return this.thinkwareForm.get('branch').value.split(' - ')[0] === '00001';
        }
        return false;
    }

    get memberForms() {
        return this.thinkwareForm.get('memberForm') as FormArray;
    }

    autogrow(idTextArea: string) {
        const textArea = document.getElementById(idTextArea);
        textArea.style.overflow = 'hidden';
        textArea.style.height = '0px';
        textArea.style.height = textArea.scrollHeight + 'px';
    }

    blankTWSuggestion() {
        this.thinkwareSuggestions = null;
    }

    checkFormValidity(evt?: Event): void {

        evt.preventDefault();

        // check PIC
        let PICState = false;
        if (this.thinkwareForm.get('leaderName').value !== '' && this.thinkwareForm.get('leaderName').value !== null) {
            if (this.isPIC.npk === this.thinkwareForm.get('leaderName').value.split(' - ')[0]) {
                PICState = true;
            }
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

        const now = new Date();
        now.setHours(0);
        now.setMilliseconds(0);
        now.setMinutes(0);
        now.setSeconds(0);

        // check detail
        let proposalOK = true;
        switch (this.thinkwareForm.get('category').value) {
            case 'SS' :
                this.uiState.detailIsValid = this.SSEmit.valid;
                if (now >= this.lookup.minProposalSS && now <= this.lookup.maxProposalSS) {
                    this.uiState.proposalSS = true;
                } else {
                    this.uiState.proposalSS = false;
                    proposalOK = false;
                }
            break;
            case 'QCP' :
                this.uiState.detailIsValid = this.QCPEmit.valid;
                if (now >= this.lookup.minProposalQCP && now <= this.lookup.maxProposalQCP) {
                    this.uiState.proposalQCP = true;
                } else {
                    this.uiState.proposalQCP = false;
                    proposalOK = false;
                }
            break;
            case 'QCC' :
                this.uiState.detailIsValid = this.QCCEmit.valid;
                if (now >= this.lookup.minProposalQCC && now <= this.lookup.maxProposalQCC) {
                    this.uiState.proposalQCC = true;
                } else {
                    this.uiState.proposalQCC = false;
                    proposalOK = false;
                }
            break;
            case 'II' :
                this.uiState.detailIsValid = this.IIEmit.valid;
                if (now >= this.lookup.minProposalII && now <= this.lookup.maxProposalII) {
                    this.uiState.proposalII = true;
                } else {
                    this.uiState.proposalII = false;
                    proposalOK = false;
                }
            break;
            case '' :
                this.uiState.detailIsValid = false;
            break;
        }
        // akhir cek detail

        // cek leader dan member tidak sama
        this.isFieldIdentic = false;
        for (let index = 0; index < this.memberForms.length; index++) {
            if (this.thinkwareForm.get('leaderName').value.split(' - ')[0] ===
            this.memberForms.at(index).get('memberName').value.split(' - ')[0]) {
                this.isFieldIdentic = true;
                break;
            }
        }

        if (!this.isFieldIdentic && this.memberForms.length > 0) {
            for (let index = 0; index < this.memberForms.length - 1; index++) {
                for (let index1 = index + 1; index1 < this.memberForms.length; index1++) {
                    if (this.memberForms.at(index).get('memberName').value.split(' - ')[0] ===
                    this.memberForms.at(index1).get('memberName').value.split(' - ')[0]) {
                        this.isFieldIdentic = true;
                    }
                }
            }
        }
        // akhir cek leader dan member tidak sama

        this.uiState.saveIsPressed = true;

        if (this.thinkwareForm.get('category').value === '') {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else if ((!this.thinkwareForm.valid || !this.IIEmit.valid ) && this.categoryM === 'II') {
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
                message: 'Tidak dapat edit Proposal karena Anda tidak terdaftar sebagai PIC',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else if (this.isFieldIdentic) {
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
        } else if (this.thinkwareForm.valid && this.uiState.detailIsValid && proposalOK) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

            // menghilangkan alert ketika form telah valid
            this.responseOnAction = null;

        } else if (this.memberForms.length > 0 && !this.memberForms.valid && this.lookup.maxProjectMember !== Number.POSITIVE_INFINITY) {
            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
        } else {
            // jika tidak dalam jangka waktu proposal
            switch (this.thinkwareForm.get('category').value) {
                case 'SS' :
                if (!this.uiState.proposalSS) {
                    proposalOK = false;
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Tidak bisa membuat proposal Suggest System! Diluar masa pembuatan proposal Suggest System',
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
                break;

                case 'QCC' :
                if (!this.uiState.proposalQCC && this.thinkwareForm.get('category').value === 'QCC') {
                    proposalOK = false;
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Tidak bisa membuat proposal Quality Control Circle!' +
                                 ' Diluar masa pembuatan proposal Quality Control Circle',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else if (this.QCCSubCategory.length > 0 &&
                (this.QCCEmit.get('categoryQCC').value === null || this.QCCEmit.get('categoryQCC').value === '')) {
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
                break;

                case 'QCP' :
                if (!this.uiState.proposalQCP && this.thinkwareForm.get('category').value === 'QCP') {
                    proposalOK = false;
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Tidak bisa membuat proposal Quality Control Production!' +
                                 'Diluar masa pembuatan proposal Quality Control Production',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else if (this.QCPSubCategory.length > 0 &&
                    (this.QCPEmit.get('categoryQCP').value === null || this.QCPEmit.get('categoryQCP').value === '')) {
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else {
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Proses penyimpanan belum berhasil, silahkan cek kembali inputan anda',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
                break;
                case 'II' :
                if (!this.uiState.proposalII && this.thinkwareForm.get('category').value === 'II') {
                    proposalOK = false;
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Tidak bisa membuat proposal Innovation Idea! Diluar masa pembuatan proposal Innovation Idea',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else if (this.IISubCategory.length > 1 &&
                    (this.IIEmit.get('categoryII').value === null || this.IIEmit.get('categoryII').value === '')) {
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
            // (akhir) jika tidak dalam jangka waktu proposal
        }

    }

    clearData(event) {
        this.uiState.memberBtnIsDisable = true;
        // mengosongkan member
        for (let index = this.memberForms.length; index >= 0; index--) {
            this.memberForms.removeAt(index);
        }
        if (this.thinkwareForm.get('category').value === 'SS') {
            this.placeHolderNamaLeader = 'Nama';
        } else {
            this.placeHolderNamaLeader = 'Nama Team Leader';
        }

        this.headOffice = null;
        this.responseOnAction = null;
        this.categoryM = event;
        this.thinkwareSuggestions = null;
        this.thinkwareForm.enable();
        this.thinkwareForm.get('branch').disable();
        this.thinkwareForm.get('department1').disable();
        this.thinkwareForm.get('department2').disable();
        this.thinkwareForm.get('supervisor1').disable();
        this.thinkwareForm.get('supervisor2').disable();
        this.thinkwareForm.get('leaderName').reset();
        this.thinkwareForm.get('branch').reset();
        this.thinkwareForm.get('department1').reset();
        this.thinkwareForm.get('department2').reset();
        this.thinkwareForm.get('supervisor1').reset();
        this.thinkwareForm.get('supervisor2').reset();
        this.IIEmit.reset();
        this.QCPEmit.reset();
        this.QCCEmit.reset();

        switch (this.thinkwareForm.get('category').value) {
            case 'SS':
            if (this.lookup.errorSS) {
                this.uiState.memberBtnIsDisable = true;
                this.thinkwareForm.disable();
                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    message: 'silahkan cek periode proposal',
                    type: 'ErrorResponse'
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            } else if (!this.uiState.proposalSS || this.uncheckSS) {
                    this.uiState.memberBtnIsDisable = true;
                    this.thinkwareForm.disable();
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Kategori ' + this.categoryM + ' sedang tidak dalam masa proposal, mohon pilih kategori lain',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
                break;

            case 'QCP':
            this.lookup.maxProjectMember = this.maxMemberQCP;
            if (this.lookup.errorQCP) {
                this.uiState.memberBtnIsDisable = true;
                this.thinkwareForm.disable();
                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    message: 'silahkan cek periode proposal',
                    type: 'ErrorResponse'
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            } else if (!this.uiState.proposalQCP || this.uncheckQCP) {
                    this.uiState.memberBtnIsDisable = true;
                    this.thinkwareForm.disable();
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Kategori ' + this.categoryM + ' sedang tidak dalam masa proposal, mohon pilih kategori lain',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
                break;

            case 'QCC':
            this.lookup.maxProjectMember = this.maxMemberQCC;
            if (this.lookup.errorQCC) {
                this.uiState.memberBtnIsDisable = true;
                this.thinkwareForm.disable();
                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    message: 'silahkan cek periode proposal',
                    type: 'ErrorResponse'
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            } else if (!this.uiState.proposalQCC || this.uncheckQCC) {
                    this.uiState.memberBtnIsDisable = true;
                    this.thinkwareForm.disable();
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Kategori ' + this.categoryM + ' sedang tidak dalam masa proposal, mohon pilih kategori lain',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
                break;

            case 'II':
            this.lookup.maxProjectMember = this.maxMemberII;
            if (this.lookup.errorII) {
                this.uiState.memberBtnIsDisable = true;
                this.thinkwareForm.disable();
                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    message: 'silahkan cek periode proposal',
                    type: 'ErrorResponse'
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            } else if (!this.uiState.proposalII || this.uncheckII) {
                    this.uiState.memberBtnIsDisable = true;
                    this.thinkwareForm.disable();
                    this.responseOnAction = {
                        ...{} as ErrorResponse,
                        message: 'Kategori ' + this.categoryM + ' sedang tidak dalam masa proposal, mohon pilih kategori lain',
                        type: 'ErrorResponse'
                    };

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
                break;
        }

        this.thinkwareForm.get('category').enable();
        this.memberCounter = 0;
        this.thinkwareSuggestions = null;
    }

    filteredSuggestion(thinkwareSuggestions, indexMember2Ignore?) {
        // set filter dari form
        const filterNpk = [];
        if (this.thinkwareForm.get('leaderName').value !== ''
            && this.thinkwareForm.get('leaderName').value !== null) {
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

    initialSetup(): void {
        this.thinkwareSvc.getIsPIC(this.authSvc.getAuth.username)
            .subscribe( (isPic) => {
            this.isPIC = isPic;
            }
        );

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

        this.now.setHours(0);
        this.now.setMilliseconds(0);
        this.now.setMinutes(0);
        this.now.setSeconds(0);

        this.uiState.memberBtnIsDisable = true;
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

    invalidCategory() {
        if (this.thinkwareForm.get('category').value === '' && this.uiState.saveIsPressed) {
            return true;
        }
        return false;
    }

    leaderTerpilih(event) {

        this.uiState.memberBtnIsDisable = false;
        this.headOffice = 'false';

        this.thinkwareForm.get('leaderName').setValue(event.option.value.username + ' - ' + event.option.value.fullName);
        this.thinkwareForm.get('branch').setValue(event.option.value.glCode + ' - ' + event.option.value.branchName);

        this.branchSave = event.option.value.branchCode;
        this.thinkwareSuggestions = null;

        if (this.branchSave === 'HEADOFFICE') {
            this.headOffice = 'true';
            this.thinkwareForm.get('department1').setValue(event.option.value.dept1);
        }

        // memanggil department 2
        this.thinkwareSvc.getDept2(event.option.value.personId, event.option.value.username)
        .subscribe((hasilDept) => {
            this.thinkwareForm.get('department2').setValue(hasilDept.spvOrgName1);
        });
    }

    // ambil data dari lookup berdasarkan nama
    meaningMap(dataList: any[], name: string) {
        for (let index = 0; index < dataList.length; index++) {
            if (dataList[index].detailCode === name) {
                const str = dataList[index].meaning.split('-');
                const dd = str[0];
                const mm = str[1];
                const yy = str[2];
                // return yy + ',' + mm + ',' + dd;
                return mm + '/' + dd + '/' + yy;
                // dd-mm-yyyy -> mm-dd-yyyy
            }
        }
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
                });

            this.memberForms.at(i).get('memberName').valueChanges
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    filter(namaLeader => namaLeader && namaLeader.length >= this.lookup.minChar),
                    concatMap(namaLeader => this.thinkwareSvc.getThinkwareSuggest
                        (this.isPIC.branchCode, namaLeader))
                )
            .subscribe(thinkwareSuggestions => {
                this.filteredSuggestion(thinkwareSuggestions, i);
                if (thinkwareSuggestions.length > 0) {
                    this.suggestionCheck = thinkwareSuggestions;
                }
                this.suggestionMember[i] = false;
            });

    }

    memberTerpilih(event, i) {
        this.memberForms.at(i).get('memberName').setValue(event.option.value.username + ' - ' + event.option.value.fullName);
        this.memberForms.at(i).get('memberBranchCode').setValue(event.option.value.branchCode);
        this.thinkwareSuggestions = null;
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

    save(): void {

        this.uiState.isSaving = true;

        const detailII: DetailII = this.IIEmit.getRawValue();

        const detailQCC: DetailQCC = this.QCCEmit.getRawValue();

        const detailQCP: DetailQCP = this.QCPEmit.getRawValue();

        const detailSS: DetailSS = this.SSEmit.getRawValue();

        const detailMember: DetailMember[] = [];
        // mengisi Member ke payload
        for (let index = 0; index < this.memberForms.length; index++) {
            const member4push: DetailMember = {
                active: true,
                memberName: this.memberForms.at(index).get('memberName').value.split(' - ')[1],
                memberNpk: this.memberForms.at(index).get('memberName').value.split(' - ')[0],
                branch: this.memberForms.at(index).get('memberBranchCode').value
            };
            detailMember.push(member4push);
        }
        // akhir mengisi Member ke payload

        // memisahkan nama branch dengan id branch
        const branchId = this.branchSave;
        // akhir memisahkan nama branch dengan id branch

        // mengisi payload
        const thinkwareSave: ThinkwareSave = {
            branch: branchId,
            category: this.thinkwareForm.get('category').value,
            department1: this.thinkwareForm.get('department1').value,
            department2: this.thinkwareForm.get('department2').value,
            detailII: detailII,
            detailSS: detailSS,
            detailQCC: detailQCC,
            detailQCP: detailQCP,
            detailsMember: detailMember,
            leaderName: this.thinkwareForm.get('leaderName').value.split(' - ')[1],
            leaderNpk: this.thinkwareForm.get('leaderName').value.split(' - ')[0],
            title: this.thinkwareForm.get('title').value.toUpperCase(),
            status: 'PROPOSAL_SUBMITTED',
            supervisor1: this.thinkwareForm.get('supervisor1').value,
            supervisor2: this.thinkwareForm.get('supervisor2').value
        };
        // akhir mengisi payload

        // menghapus detail yang tidak digunakan
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
        // akhir menghapus detail yang tidak digunakan

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
