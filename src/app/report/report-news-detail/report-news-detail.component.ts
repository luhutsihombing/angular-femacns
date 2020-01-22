import {ContentService} from '../../content/_service/content.service';
import {ContentSuggestion} from '../../content/_model/content.model';
import {ContentSearchService} from '../../content/content-search/content-search.service';
import * as $ from 'jquery';
import {API_RESOURCE_REPORT_LOGO} from '../../_const/api.const';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {MAT_DATE_FORMATS} from '@angular/material';
import {ReportData} from '../_model/report.model';
import {ReportNewsDetailSearchTerm} from '../_model/report.model';
import {ReportService} from '../_service/report.service';
import {SearchUtil} from '../../_util/search.util';
import {ReportType} from '../_const/report-type.const';
import {filter, switchMap, tap, debounceTime, distinctUntilChanged, finalize} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {combineLatest} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'fema-cms-report-news-detail',
    templateUrl: './report-news-detail.component.html',
    styleUrls: ['./report-news-detail.component.scss'],
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
export class ReportNewsDetailComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDate: Date;
    reportForm: FormGroup;
    srcImage: any;

    employeeAll: any;
    contentSuggestions: ContentSuggestion[];
    reportData: ReportData;
    qParams: ReportNewsDetailSearchTerm;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    lookup: {
        minChar: number;
        pageSize: number;
    };

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

    get viewerDatalist(): string {
        return this.reportForm.get('viewer').value.length >= this.lookup.minChar ? 'viewerSuggestion' : '';
    }

    get titleDatalist(): string {
        return this.reportForm.get('title').value.length >= this.lookup.minChar ? 'contentSuggestions' : '';
    }

    set resetCalendar(formControlName: string) {
        this.reportForm.get(formControlName).patchValue('');
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private contentSearchSvc: ContentSearchService,
        private reportSvc: ReportService,
        private searchUtil: SearchUtil,
        private contentSvc: ContentService
    ) {

        this.reportForm = fb.group({
            title: '',
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            viewer: '',
        });

        this.lookup = {
            minChar: 2,
            pageSize: 20
        };

        this.currentDate = new Date();

        this.uiState = {
            endDateIsOpen: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startDateIsOpen: false,
            isSearching: false
        };

        this.srcImage = `${API_RESOURCE_REPORT_LOGO}/fifgroup_logo.png`;

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
            .subscribe(contentSuggestions => this.contentSuggestions = contentSuggestions);

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

                    return this.reportSvc.getSearchResults(ReportType.NEWS_DETAIL, {
                        ...this.qParams,
                        viewer: this.qParams.viewer.split('-')[0]
                    }).pipe(finalize(() => this.uiState.isSearching = false));

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
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS'),
            this.contentSvc.getViewerHistorySuggestion()
        )
            .subscribe(
                ([minChar, pageSize, viewers]) => {

                    this.lookup = {minChar, pageSize};
                    this.employeeAll = viewers;

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        this.showInvalidAlert()
            ? $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing')
            : this.searchByInput();

    }

    showInvalidAlert(): boolean {

        return this.uiState.searchIsPressed && this.reportForm.invalid;

    }

    searchByInput(): void {

        const term: ReportNewsDetailSearchTerm = {
            ...this.reportForm.getRawValue(),
            endDate: this.reportForm.get('endDate').value.format('YYYY-MM-DD'),
            startDate: this.reportForm.get('startDate').value.format('YYYY-MM-DD'),
        };

        this.router.navigate(['/report/news-detail'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.NEWS_DETAIL, this.qParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-REPORT-NEWSINFO-DETAIL-(${new Date().getTime()}).xls`;
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

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.reportForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

}
