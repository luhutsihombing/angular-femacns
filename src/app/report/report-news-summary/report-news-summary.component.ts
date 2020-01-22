import {API_RESOURCE_REPORT_LOGO} from '../../_const/api.const';
import {SearchUtil} from '../../_util/search.util';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {MAT_DATE_FORMATS} from '@angular/material';
import {ReportData, ReportNewsDetailSearchTerm} from '../_model/report.model';
import {ReportNewsSummarySearchTerm} from '../_model/report.model';
import {ReportService} from '../_service/report.service';
import {ReportType} from '../_const/report-type.const';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import * as $ from 'jquery';
import {ContentSearchService} from '../../content/content-search/content-search.service';
import {ContentSuggestion} from '../../content/_model/content.model';
import * as moment from 'moment';
import {combineLatest} from 'rxjs';

@Component({
    selector: 'fema-cms-report-news-summary',
    templateUrl: './report-news-summary.component.html',
    styleUrls: ['./report-news-summary.component.scss'],
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
export class ReportNewsSummaryComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDate: Date;
    reportForm: FormGroup;
    srcImage: string;

    reportData: ReportData;

    lookup: {
        minChar: number;
        pageSize: number;
    };
    suggestion: {
        contents: ContentSuggestion[];
    };
    qParams: ReportNewsSummarySearchTerm;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        endDateIsOpen: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateIsOpen: boolean;
        isSearching: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.reportData && this.reportData.entries ? this.reportData.entries.length === 0 : true;
    }

    get titleDatalist(): string {
        return this.reportForm.get('title').value.length >= this.lookup.minChar ? 'contentSuggestions' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private contentSearchSvc: ContentSearchService,
        private lookupSvc: LookupService,
        private reportSvc: ReportService,
        private searchUtil: SearchUtil,
    ) {

        this.currentDate = new Date();

        this.reportForm = fb.group({
            title: '',
            startDate: ['', Validators.required],
            endDate: ['', Validators.required]
        });

        this.reportData = {} as ReportData;

        this.lookup = {
            minChar: 2,
            pageSize: 10
        };

        this.suggestion = {
            contents: []
        };

        this.srcImage = `${API_RESOURCE_REPORT_LOGO}/fifgroup_logo.png`;

        this.uiState = {
            endDateIsOpen: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startDateIsOpen: false,
            isSearching: false
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.reportForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                filter(title => title && title.length >= this.lookup.minChar),
                distinctUntilChanged(),
                switchMap(title => this.contentSearchSvc.getContentSuggestion(title))
            )
            .subscribe(contentSuggestions => this.suggestion.contents = contentSuggestions);

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.reportData = {} as ReportData;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    if (this.searchUtil.noSearchParams(this.qParams)) {

                        this.reportForm.patchValue({} as ReportNewsDetailSearchTerm);

                    } else {

                        this.reportForm.patchValue({
                            ...this.qParams,
                            startDate: this.qParams.startDate ? moment(this.qParams.startDate) : '',
                            endDate: this.qParams.endDate ? moment(this.qParams.endDate) : ''
                        });

                    }

                    return this.reportSvc.getSearchResults(ReportType.NEWS_SUMMARY, this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                reportData => this.reportData = reportData,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

    ngAfterViewChecked() {

        this.cdr.detectChanges();

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS')
        )
            .subscribe(
                ([minChar, pageSize]) => this.lookup = {minChar, pageSize},
                error => this.errorOnInit = {...error, type: 'ErrorResponse'}
            );

    }

    resetCalendar(formControlName: string): void {

        this.reportForm.get(formControlName).patchValue('');

    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.responseOnAction = undefined;

        this.uiState.searchIsPressed = true;

        this.showInvalidAlert()
            ? $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing')
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.NEWS_SUMMARY, this.qParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-REPORT-NEWSINFO-SUMMARY-(${new Date().getTime()}).xls`;
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

    showInvalidAlert(): boolean {
        return this.uiState.searchIsPressed && this.reportForm.invalid;

    }

    searchByInput(): void {

        this.responseOnAction = undefined;

        let startDate = this.reportForm.get('startDate').value;
        startDate = typeof startDate === 'object' ? startDate.format('YYYY-MM-DD') : startDate;

        let endDate = this.reportForm.get('endDate').value;
        endDate = typeof endDate === 'object' ? endDate.format('YYYY-MM-DD') : endDate;

        const term: ReportNewsSummarySearchTerm = {...this.reportForm.getRawValue(), startDate, endDate};

        this.router.navigate(['/report/news-summary'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.reportForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

}
