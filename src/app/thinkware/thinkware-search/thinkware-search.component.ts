import {SearchUtil} from '../../_util/search.util';
import {ActivatedRoute, Router} from '@angular/router';
import {ThinkwareSearchTerm, ThinkwareSearchItem, ThinkwareDetailItem,
    BranchNameMapList,
    TitleSuggestion,
    BranchSuggestion,
    CodeSuggestion,
    ThinkwareSuggestion,
    GlCodeMapList} from '../_model/thinkware.model';
import {ThinkwareService} from '../_service/thinkware.service';
import {FormGroup, FormBuilder, FormControl} from '@angular/forms';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ClrDatagridStateInterface} from '@clr/angular';
import {MAT_DATE_FORMATS} from '@angular/material';
import {Subject} from 'rxjs';
import {debounceTime, tap, finalize, switchMap, distinctUntilChanged, filter, concatMap} from 'rxjs/operators';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';
import * as moment from 'moment';
import {LookupService } from '../../lookup/_service/lookup.service';
import {DatePipe } from '@angular/common';
import { ReportType } from '../../report/_const/report-type.const';
import { ReportService } from '../../report/_service/report.service';
import { AuthService } from '../../auth/_service/auth.service';

@Component({
    selector: 'fema-cms-thinkware-search',
    templateUrl: './thinkware-search.component.html',
    styleUrls: ['./thinkware-search.component.scss'],
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
export class ThinkwareSearchComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;

    thinkwareForm: FormGroup;
    maxProposal;
    minProposal;
    branchDownload: String;
    thinkwareDetail: ThinkwareDetailItem;
    thinkwareDetailParams: ThinkwareDetailItem;
    thinkwareId: string;
    now = new Date();
    thinkwareSearchList: PaginatedResponse<ThinkwareSearchItem>;
    qParams: SearchPagination<ThinkwareSearchTerm>;

    titleSuggestions: TitleSuggestion[];
    branchSuggestions: BranchSuggestion[];
    codeSuggestions: CodeSuggestion[];
    namaSuggestions: ThinkwareSuggestion[];

    categoryList: any[] = [
        {value: '', label: '- - Please Select -'}
    ];

    lookup: {
        minChar: number;
        pageSize: number;
    };

    // cek risalah atau bukan
    check: string;
    checkII: string;
    checkSS: string;
    checkQCP: string;
    checkQCC: string;

    // cek jika bukan risalah dan proposal
    iiRnp: boolean;
    ssRnp: boolean;
    qcpRnp: boolean;
    qccRnp: boolean;

    // isPic
    isPic: boolean;
    isLeader: boolean;
    isBranch: boolean;
    flagMember: string;
    flagBranch: string;

    // cek hasil akhir proposal atau risalah
    isProposal: Array<String> = [];
    isRisalah: Array<String> = [];

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        detailModalIsOpen: boolean;
        isSearching: boolean;
        reminderFailModalIsOpen: boolean;
        reminderModalIsOpen: boolean;
        reminderSuccessModalIsOpen: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateProposalIsOpen: boolean;
        startDateRisalahIsOpen: boolean;
        endDateProposalIsOpen: boolean;
        endDateRisalahIsOpen: boolean;
    };

    get todayDate(): String {
        const date = new Date().toLocaleDateString().split('/');
        const hari = date[1];
        const bulan = date[0];
        const tahun = date[2];
        // YYYY-MM-DD
        return tahun + '-' + bulan + '-' + hari;
    }

    readonly startDateIsNotPassed = (date: string): boolean => new Date(date) > new Date()
        && date !== new Date().toISOString().split('T')[0]

    get downloadIsDisabled(): boolean {
        return this.thinkwareSearchList && this.thinkwareSearchList.dataList ?
            this.thinkwareSearchList.dataList.length === 0 : true;
    }

    get titleDatalist(): string {
        return this.thinkwareForm.get('title').value.length >= this.lookup.minChar ? 'titleSuggestions' : '';
    }

    get branchDatalist(): string {
        return this.thinkwareForm.get('branch').value.length >= this.lookup.minChar ? 'branchSuggestions' : '';
    }

    get codeDatalist(): string {
        return this.thinkwareForm.get('codeProject').value.length >= this.lookup.minChar ? 'codeSuggestions' : '';
    }

    get nameDatalist(): string {
        return this.thinkwareForm.get('memberName').value.length >= 4 ? 'namaSuggestions' : '';
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<ThinkwareSearchTerm>;

        if (this.qParams && this.thinkwareSearchList.hasOwnProperty('dataList')) {

            term = {
                data: this.thinkwareForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.thinkwareSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/thinkware/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    constructor(
        private authSvc: AuthService,
        private ar: ActivatedRoute,
        private formBuilder: FormBuilder,
        public datepipe: DatePipe,
        private router: Router,
        private reportSvc: ReportService,
        private thinkwareSvc: ThinkwareService,
        private searchUtil: SearchUtil,
        private lookupSvc: LookupService
    ) {
        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.thinkwareForm = formBuilder.group({
            title: [''],
            codeProject: [''],
            memberName: [''],
            status: [''],
            branch: [''],
            category: [''],
            startDateProposal: [''],
            startDateRisalah: [''],
            endDateProposal: [''],
            endDateRisalah: [''],
            username: ['']
        });

        this.thinkwareDetail = {} as ThinkwareDetailItem;

        this.thinkwareSearchList = {} as PaginatedResponse<ThinkwareSearchItem>;

        this.uiState = {
            detailModalIsOpen: false,
            isSearching: false,
            reminderFailModalIsOpen: false,
            reminderModalIsOpen: false,
            reminderSuccessModalIsOpen: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startDateProposalIsOpen: false,
            startDateRisalahIsOpen: false,
            endDateProposalIsOpen: false,
            endDateRisalahIsOpen: false,
        };

        this.lookup = {
            minChar: 2,
            pageSize: 20
        };

        this.isBranch = false;
        this.isPic = false;
        this.isLeader = false;
        this.flagBranch = '0';
        this.flagMember = '0';

    }

    ngOnInit() {

        this.now.setHours(0);
        this.now.setMilliseconds(0);
        this.now.setMinutes(0);
        this.now.setSeconds(0);

        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_II').subscribe((fullData) => {
            const minProposalII = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_II'));
            const maxProposalII = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_II'));
            const minRisalahII = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_II'));
            const maxRisalahII = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_II'));

            if (this.now >= minProposalII && this.now <= maxProposalII) {
                this.checkII = 'proposal';
            } else if (this.now >= minRisalahII && this.now <= maxRisalahII) {
                this.checkII = 'risalah';
            } else {
                this.checkII = 'false';
            }

            if (this.checkII === 'false') {
                this.iiRnp = true;
            } else {
                this.iiRnp = false;
            }

        });
        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_SS').subscribe((fullData) => {
            const minProposalSS = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_SS'));
            const maxProposalSS = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_SS'));
            const minRisalahSS = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_SS'));
            const maxRisalahSS = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_SS'));

            if (this.now >= minProposalSS && this.now <= maxProposalSS) {
                this.checkSS = 'proposal';
            } else if (this.now >= minRisalahSS && this.now <= maxRisalahSS) {
                this.checkSS = 'risalah';
            } else {
                this.checkSS = 'false';
            }

            if (this.checkSS === 'false') {
                this.ssRnp = true;
            } else {
                this.ssRnp = false;
            }
        });

        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_QCC').subscribe((fullData) => {
            const minProposalQCC = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_QCC'));
            const maxProposalQCC = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_QCC'));
            const minRisalahQCC = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_QCC'));
            const maxRisalahQCC = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_QCC'));

            if (this.now >= minProposalQCC && this.now <= maxProposalQCC) {
                this.checkQCC = 'proposal';
            } else if (this.now >= minRisalahQCC && this.now <= maxRisalahQCC) {
                this.checkQCC = 'risalah';
            } else {
                this.checkQCC = 'false';
            }

            if (this.checkQCC === 'false') {
                this.qccRnp = true;
            } else {
                this.qccRnp = false;
            }
        });
        this.lookupSvc.getLookupDetailList('THINKWARE_PERIODE_QCP').subscribe((fullData) => {
            const minProposalQCP = new Date(this.meaningMap(fullData.dataList, 'START_PROPOSAL_QCP'));
            const maxProposalQCP = new Date(this.meaningMap(fullData.dataList, 'END_PROPOSAL_QCP'));
            const minRisalahQCP = new Date(this.meaningMap(fullData.dataList, 'START_RISALAH_QCP'));
            const maxRisalahQCP = new Date(this.meaningMap(fullData.dataList, 'END_RISALAH_QCP'));

            if (this.now >= minProposalQCP && this.now <= maxProposalQCP) {
                this.checkQCP = 'proposal';
            } else if (this.now >= minRisalahQCP && this.now <= maxRisalahQCP) {
                this.checkQCP = 'risalah';
            } else {
                this.checkQCP = 'false';
            }

            if (this.checkQCP === 'false') {
                this.qcpRnp = true;
            } else {
                this.qcpRnp = false;
            }
        });

        this.thinkwareForm.get('title').valueChanges.subscribe(title =>
            title === ''
                ? this.thinkwareForm.get('title').patchValue('', {emitEvent: false})
                : title
        );

        this.thinkwareForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(title => title && title.length >= this.lookup.minChar),
                concatMap(title => this.thinkwareSvc.getTitleSuggestion(title))
            )
            .subscribe(titleSuggestions => this.titleSuggestions = titleSuggestions);

        this.thinkwareForm.get('branch').valueChanges.subscribe(branch =>
            branch === ''
                ? this.thinkwareForm.get('branch').patchValue('', {emitEvent: false})
                : branch
        );

        this.thinkwareForm.get('branch').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(branch => branch && branch.length >= this.lookup.minChar),
                concatMap(branch => this.thinkwareSvc.getBranchSuggestion(branch))
            )
            .subscribe((branchSuggestions) => this.branchSuggestions = branchSuggestions);

        this.thinkwareForm.get('category').valueChanges.subscribe(category =>
            category === ''
                ? this.thinkwareForm.get('category').patchValue('', {emitEvent: false})
                : category
        );

        this.thinkwareForm.get('memberName').valueChanges
        .pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(memberName => memberName && memberName.length >= this.lookup.minChar),
            concatMap(memberName => this.thinkwareSvc.getThinkwareSuggestion(memberName))
        )
        .subscribe(namaSuggestions => this.namaSuggestions = namaSuggestions);

        this.thinkwareForm.get('memberName').valueChanges.subscribe(memberName =>
            memberName === ''
                ? this.thinkwareForm.get('memberName').patchValue('', {emitEvent: false})
                : memberName
        );

        this.thinkwareForm.get('codeProject').valueChanges.subscribe(codeProject =>
            codeProject === ''
                ? this.thinkwareForm.get('codeProject').patchValue('', {emitEvent: false})
                : codeProject
        );

        this.thinkwareForm.get('codeProject').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(code => code && code.length >= this.lookup.minChar),
                concatMap(code => this.thinkwareSvc.getCodeSuggestion(code))
            )
            .subscribe(codeSuggestions => this.codeSuggestions = codeSuggestions);

        this.thinkwareForm.get('status').valueChanges.subscribe(status =>
            status === ''
                ? this.thinkwareForm.get('status').patchValue('', {emitEvent: false})
                : status
        );

        this.thinkwareForm.get('startDateProposal').valueChanges.subscribe(startDateProposal =>
            typeof startDateProposal === 'string'
                ? startDateProposal
                : this.thinkwareForm.get('startDateProposal').patchValue(startDateProposal.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.thinkwareForm.get('endDateProposal').valueChanges.subscribe(endDateProposal =>
            typeof endDateProposal === 'string'
                ? endDateProposal
                : this.thinkwareForm.get('endDateProposal').patchValue(endDateProposal.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.thinkwareForm.get('startDateRisalah').valueChanges.subscribe(startDateRisalah =>
            typeof startDateRisalah === 'string'
                ? startDateRisalah
                : this.thinkwareForm.get('startDateRisalah').patchValue(startDateRisalah.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.thinkwareForm.get('endDateRisalah').valueChanges.subscribe(endDateRisalah =>
            typeof endDateRisalah === 'string'
                ? endDateRisalah
                : this.thinkwareForm.get('endDateRisalah').patchValue(endDateRisalah.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.thinkwareSearchList = {} as PaginatedResponse<ThinkwareSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        searchIsPressed: false,
                        isSearching: true,
                    };

                }),
                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);
                    this.thinkwareForm.patchValue(this.qParams.data);
                    this.qParams.data.username = this.authSvc.getAuth.username;

                    return this.thinkwareSvc.searchThinkwareList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                (thinkwareSearchList) => {
                        for (let index = 0; index < thinkwareSearchList.dataList.length; index++) {
                        const a = thinkwareSearchList.dataList[index].createdDateProposal.split('.')[0];
                        const b = thinkwareSearchList.dataList[index].createdDateRisalah.split('.')[0];
                        const dateProposal = new Date(a.replace(/-/g, '/'));
                        const dateRisalah = new Date(b.replace(/-/g, '/'));
                        const convertProposal = moment(dateProposal);
                        const convertRisalah = moment(dateRisalah);
                        const proposal = convertProposal.format('DD MMM YYYY H:mm:ss a');
                        const risalah = convertRisalah.format('DD MMM YYYY H:mm:ss a');
                        if (isNaN(dateRisalah.getTime())) {
                            thinkwareSearchList.dataList[index].createdDateRisalah = '';
                        } else {
                            thinkwareSearchList.dataList[index].createdDateRisalah = risalah + ' WIB';
                        }
                        thinkwareSearchList.dataList[index].createdDateProposal = proposal + ' WIB';
                    }
                    this.thinkwareSearchList = thinkwareSearchList;
                    const branchName = this.removeDuplicates(this.membuatListBranchId(thinkwareSearchList));
                    this.branchDownload = branchName;
                    this.thinkwareSvc.getGlCodes(branchName).subscribe((glCode) => this.isiSearchListGlCode(glCode));
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );


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

        this.clrPage.pipe(
            debounceTime(300),
            distinctUntilChanged((prevState, currentState) => JSON.stringify(prevState) === JSON.stringify(currentState))
        ).subscribe(state => this.searchByPagination(state));

    }


    membuatListBranchId(thinkwareSearchList): any[] {
        const branchList = [];
        for (let index = 0; index < thinkwareSearchList.dataList.length; index++) {
            branchList.push(thinkwareSearchList.dataList[index].branch);
        }
        return branchList;
    }

    removeDuplicates(myArr) {
        const unique_array = myArr.filter(function(elem, index, self) {
            return index === self.indexOf(elem);
        });
        return unique_array;
    }

    isiSearchListGlCode(glCodes: GlCodeMapList[]) {
        for (let index = 0; index < this.thinkwareSearchList.dataList.length; index++) {
            for (let index1 = 0; index1 < glCodes.length; index1++) {
                if (glCodes[index1].branchCode !== null) {
                    if (this.thinkwareSearchList.dataList[index].branch === glCodes[index1].branchCode) {
                        this.thinkwareSearchList.dataList[index].glCode = glCodes[index1].glCode;
                        this.thinkwareSearchList.dataList[index].branchName = glCodes[index1].branchName;
                        break;
                    }
                } else {
                    this.thinkwareSearchList.dataList[index].glCode = 'Unknown GLCode';
                    this.thinkwareSearchList.dataList[index].branchName = 'Unkonw Branch';
                }
            }

            // nebeng menghilkangkan department 1 dan 2 jika bukan headOffice
            if (this.thinkwareSearchList.dataList[index].branch !== 'HEADOFFICE') {
                this.thinkwareSearchList.dataList[index].department1 = '';
                this.thinkwareSearchList.dataList[index].department2 = '';
            }
        }

        this.isProposal = [];
        this.isRisalah = [];
        for (let i = 0; i < this.thinkwareSearchList.dataList.length; i++) {
            this.isLeader = this.thinkwareSearchList.dataList[i].leader;
            this.isPic = this.thinkwareSearchList.dataList[i].pic;
            this.flagBranch = this.thinkwareSearchList.dataList[i].flagBranch;
            this.flagMember = this.thinkwareSearchList.dataList[i].flagMember;
            switch (this.thinkwareSearchList.dataList[i].category) {
                case 'II':
                if ((!this.iiRnp) &&
                ((this.isLeader || this.isPic || this.flagMember === '1') && this.flagBranch === '1')) {
                    if (this.checkII === 'proposal') {
                        this.isProposal.push('true');
                        this.isRisalah.push('false');
                    } else if (this.checkII === 'risalah') {
                        this.isProposal.push('false');
                        this.isRisalah.push('true');
                    } else {
                        this.isProposal.push('false');
                        this.isRisalah.push('false');
                    }
                } else {
                    this.isProposal.push('false');
                    this.isRisalah.push('false');
                }
                break;

                case 'SS':
                if ((!this.ssRnp) &&
                ((this.isLeader || this.isPic || this.flagMember === '1') && this.flagBranch === '1')) {
                    if (this.checkSS === 'proposal') {
                        this.isProposal.push('true');
                        this.isRisalah.push('false');
                    } else if (this.checkSS === 'risalah') {
                        this.isProposal.push('false');
                        this.isRisalah.push('true');
                    } else {
                        this.isProposal.push('false');
                        this.isRisalah.push('false');
                    }
                } else {
                    this.isProposal.push('false');
                    this.isRisalah.push('false');
                }
                break;

                case 'QCP':
                if ((!this.qcpRnp) &&
                ((this.isLeader || this.isPic || this.flagMember === '1') && this.flagBranch === '1')) {
                    if (this.checkQCP === 'proposal') {
                        this.isProposal.push('true');
                        this.isRisalah.push('false');
                    } else if (this.checkQCP === 'risalah') {
                        this.isProposal.push('false');
                        this.isRisalah.push('true');
                    } else {
                        this.isProposal.push('false');
                        this.isRisalah.push('false');
                    }
                } else {
                    this.isProposal.push('false');
                    this.isRisalah.push('false');
                }
                break;

                case 'QCC':
                if ((!this.qccRnp) &&
                ((this.isLeader || this.isPic || this.flagMember === '1') && this.flagBranch === '1')) {
                    if (this.checkQCC === 'proposal') {
                        this.isProposal.push('true');
                        this.isRisalah.push('false');
                    } else if (this.checkQCC === 'risalah') {
                        this.isProposal.push('false');
                        this.isRisalah.push('true');
                    } else {
                        this.isProposal.push('false');
                        this.isRisalah.push('false');
                    }
                } else {
                    this.isProposal.push('false');
                    this.isRisalah.push('false');
                }
                break;

            }

        }
    }

    // ambil data dari lookup berdasarkan nama
      // mengubah data meaning dari dd-mm-yy ke mm-dd-yyyy
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

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        this.searchUtil.noSearchParams(this.thinkwareForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        const username: FormControl = new FormControl;
        username.setValue(this.authSvc.getAuth.username);

        const dummy: FormGroup = this.thinkwareForm;
        const balik = dummy.get('branch').value;
        if (dummy.get('branch').value !== '') {
            dummy.get('branch').setValue(this.branchDownload);
        }
        dummy.addControl('username', username);

        this.reportSvc.getDownloadUrl(ReportType.THINKWARE_SEARCH, dummy.getRawValue())
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-THINKWARE-SEARCH-(${new Date().getTime()}).xlsx`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

            if (dummy.get('branch').value !== '') {
                dummy.get('branch').setValue(balik);
            }

    }

    downloadDetailThinkwareReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.thinkwareSvc.postDownloadUrl(this.thinkwareDetailParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-THINKWARE-KNOWLEDGE-SHARING-DETAIL-(${new Date().getTime()}).xlsx`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                });

    }

    resetCalendar(evt: Event, selector: string): void {

        evt.preventDefault();

        this.thinkwareForm.get(selector).patchValue('');

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<ThinkwareSearchTerm> = {
            data: this.thinkwareForm.getRawValue(),
            descending: false,
            orderBy: [],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.thinkwareForm.getRawValue())) {

                term = {
                    data: this.thinkwareForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.router.navigate(['/thinkware/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
