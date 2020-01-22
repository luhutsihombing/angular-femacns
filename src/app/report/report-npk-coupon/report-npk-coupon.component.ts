import {API_RESOURCE_REPORT_LOGO} from '../../_const/api.const';
import {ReportTgpItem, ReportTgpTerm} from '../_model/report.model';
import {LookupService} from '../../lookup/_service/lookup.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ChangeDetectorRef, Component, ElementRef, OnInit, AfterViewChecked, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DATE_FORMATS} from '@angular/material';
import {ReportService} from '../_service/report.service';
import {debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, tap} from 'rxjs/operators';
import {combineLatest, Subject} from 'rxjs';
import {ErrorResponse, ActionResponse, PaginatedResponse} from '../../_model/app.model';
import {ClrDatagridStateInterface} from '@clr/angular';
import * as $ from 'jquery';
import {STANDARD_MONTHS_NUMBER_SELECTION, STANDARD_NON_STRING_SELECTION} from '../../_const/standard.const';

@Component({
    selector: 'fema-cms-report-npk-coupon',
    templateUrl: './report-npk-coupon.component.html',
    styleUrls: ['./report-npk-coupon.component.scss'],
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
export class ReportNpkCouponComponent implements AfterViewChecked, OnInit {

    readonly currentDate = new Date();
    readonly srcImage = `${API_RESOURCE_REPORT_LOGO}/fifgroup_logo.png`;

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    monthSelections: Array<{ value: number; label: string }>;
    reportForm: FormGroup;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    lookup: {
        minChar: number;
        pageSize: number;
    };
    qParams: ReportTgpTerm;
    reportSearchList: PaginatedResponse<ReportTgpItem>;
    suggestion: {
        branches: string[];
        employees: string[];
        jobs: string[];
    };

    uiState: {
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.reportSearchList && this.reportSearchList.dataList ? this.reportSearchList.dataList.length === 0 : true;
    }

    get endMonth(): { value: number; label: string } {
        return this.monthSelections.find(month => +month.value === this.reportForm.get('endMonth').value);
    }

    get startMonth(): { value: number; label: string } {
        return this.monthSelections.find(month => +month.value === this.reportForm.get('startMonth').value);
    }

    get branchDatalist(): string {
        return this.reportForm.get('branch').value.length >= this.lookup.minChar ? 'branchSuggestion' : '';
    }

    get jobDatalist(): string {
        return this.reportForm.get('job').value.length >= this.lookup.minChar ? 'jobSuggestion' : '';
    }

    get speakerDatalist(): string {
        return this.reportForm.get('employee').value.length >= this.lookup.minChar ? 'speakerNameSelection' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private reportSvc: ReportService,
    ) {

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.monthSelections = STANDARD_NON_STRING_SELECTION.concat(STANDARD_MONTHS_NUMBER_SELECTION);

        this.reportForm = fb.group({
            branch: '',
            employee: '',
            endMonth: [null, Validators.required],
            job: '',
            startMonth: [null, Validators.required],
            year: ['', Validators.required],
        });

        this.lookup = {
            minChar: 2,
            pageSize: 20
        };

        this.suggestion = {
            branches: [],
            employees: [],
            jobs: [],
        };

        this.uiState = {
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.reportForm.get('employee').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(employee => employee.length >= this.lookup.minChar),
                switchMap(employee => this.reportSvc.getNpk(employee)),
                map(employees => employees.map(employee => employee.fullName))
            )
            .subscribe(employees => this.suggestion.employees = employees);

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.reportSearchList = {} as PaginatedResponse<ReportTgpItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.qParams = {
                        ...this.qParams,
                        monthFrom: +this.qParams.monthFrom,
                        monthTo: +this.qParams.monthTo,
                        year: +this.qParams.year,
                    };

                    this.reportForm.patchValue({
                        branch: this.qParams.branchName,
                        employee: this.qParams.employeeName,
                        endMonth: this.qParams.monthTo,
                        job: this.qParams.jobName,
                        startMonth: this.qParams.monthFrom,
                        year: this.qParams.year,
                    });

                    return this.reportSvc.tgpSearchResults(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                reportSearchList => this.reportSearchList = reportSearchList,
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

        this.clrPage.pipe(
            debounceTime(300),
            distinctUntilChanged((prevState, currentState) =>
                JSON.stringify(prevState) === JSON.stringify(currentState))).subscribe(state => this.searchByPagination(state));

    }

    ngAfterViewChecked() {

        this.cdr.detectChanges();

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.reportSvc.getBranchHCMS(),
            this.reportSvc.getJobHCMS(),
        )
            .pipe(
                map(([pageSize, minChar, branches, jobs]) => ({
                    lookup: {pageSize, minChar},
                    suggestion: {branches: branches.map(branch => branch.nama), jobs: jobs.map(job => job.nama)},
                }))
            )
            .subscribe(
                ({lookup, suggestion}) => {
                    this.lookup = lookup;
                    this.suggestion = {...suggestion, employees: []};
                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    resetCalendar(selector: string): void {

        this.reportForm.get(selector).patchValue('');

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.downloadTgp(this.reportForm.getRawValue())
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-REPORT-NPK-COUPON-(${new Date().getTime()}).xlsx`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    // checkBranchSuggestion(evt: Event, controlName: string | string[]) {
    //
    //     evt.preventDefault();
    //
    //     const branchSuggestion: Branch = this.branchList
    //         ? this.branchList.find(branch => `${branch.kode}~${branch.nama}` === this.reportForm.get(controlName).value)
    //         : undefined;
    //
    //     if (!branchSuggestion) {
    //         this.branchInvalid = true;
    //     }
    //
    // }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.reportForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        if (!this.invalidField(this.reportForm)) {

            this.searchByInput();

        } else {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        }

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: ReportTgpTerm = {
            branchName: this.reportForm.get('branch').value,
            employeeName: this.reportForm.get('employee').value,
            jobName: this.reportForm.get('job').value,
            monthFrom: +this.reportForm.get('startMonth').value,
            monthTo: +this.reportForm.get('endMonth').value,
            year: +this.reportForm.get('year').value,
            currentPage: 1,
            orders: [{
                columnName: 'couponNumber',
                descending: false,
            }],
            pageSize: +this.lookup.pageSize
        };

        if (this.qParams) {
            const {currentPage, orders, pageSize, ...termData} = this.qParams;

            if (JSON.stringify(termData) === JSON.stringify(this.reportForm.getRawValue())) {

                term = {
                    branchName: this.reportForm.get('branch').value,
                    employeeName: this.reportForm.get('employee').value,
                    jobName: this.reportForm.get('job').value,
                    monthFrom: +this.reportForm.get('startMonth').value,
                    monthTo: +this.reportForm.get('endMonth').value,
                    year: +this.reportForm.get('year').value,
                    currentPage, orders, pageSize
                };

            }

        }

        this.router.navigate(['/report/npk-coupon'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: ReportTgpTerm;

        if (this.qParams && this.reportSearchList.hasOwnProperty('dataList')) {

            term = {
                branchName: this.reportForm.get('branch').value,
                employeeName: this.reportForm.get('employee').value,
                jobName: this.reportForm.get('job').value,
                monthFrom: +this.reportForm.get('startMonth').value,
                monthTo: +this.reportForm.get('endMonth').value,
                year: +this.reportForm.get('year').value,
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1,
                orders: [{
                    columnName: state && state.sort && typeof state.sort.by === 'string' ? state.sort.by : 'couponNumber',
                    descending: state && state.sort ? state.sort.reverse : false,
                }],
                pageSize: +this.lookup.pageSize
            };

        } else if (this.qParams && !this.reportSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/report/npk-coupon'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
