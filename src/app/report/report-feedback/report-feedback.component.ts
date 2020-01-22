import {API_RESOURCE_REPORT_LOGO} from '../../_const/api.const';
import {ReportFeedbackQuestion} from '../_model/report.model';
import * as $ from 'jquery';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {MAT_DATE_FORMATS} from '@angular/material';
import {ReportData} from '../_model/report.model';
import {ReportFeedbackSearchTerm} from '../_model/report.model';
import {ReportService} from '../_service/report.service';
import {ReportType} from '../_const/report-type.const';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {ReportFeedbackService} from './report-feedback.service';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {combineLatest} from 'rxjs';
import {FeedbackService} from '../../feedback/_service/feedback.service';
import {Employee} from '../../event/_model/event.model';
import {EventService} from '../../event/_service/event.service';

@Component({
    selector: 'fema-cms-report-feedback',
    templateUrl: './report-feedback.component.html',
    styleUrls: ['./report-feedback.component.scss'],
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
        },
        FeedbackService,
        ReportFeedbackService
    ]
})
export class ReportFeedbackComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDate: Date;
    reportForm: FormGroup;
    srcImage: string;

    lookup: {
        minChar: number;
        pageSize: number;
    };
    qParams: ReportFeedbackSearchTerm;
    questionList: Array<ReportFeedbackQuestion>;
    reportData: ReportData;
    suggestion: {
        employees: Employee[];
        events: string[];
    };

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        endDateIsOpen: boolean;
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateIsOpen: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.reportData && this.reportData.entries ? this.reportData.entries.length === 0 : true;
    }

    get eventDatalist(): string {
        return this.reportForm.get('eventName').value.length >= this.lookup.minChar ? 'eventSuggestion' : '';
    }

    get respondenDatalist(): string {
        return this.reportForm.get('responden').value.length >= this.lookup.minChar ? 'respondenSuggestions' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private eventSvc: EventService,
        private feedbackSvc: FeedbackService,
        private lookupSvc: LookupService,
        private reportSvc: ReportService,
        private reportFeedbackSvc: ReportFeedbackService
    ) {

        this.currentDate = new Date();
        this.reportForm = fb.group({
            responden: '',
            eventName: ['', Validators.required],
            startDate: '',
            endDate: ''
        });
        this.srcImage = `${API_RESOURCE_REPORT_LOGO}/fifgroup_logo.png`;

        this.reportData = {} as ReportData;

        this.lookup = {
            minChar: 0,
            pageSize: 10,
        };
        this.suggestion = {
            employees: [],
            events: []
        };

        this.uiState = {
            endDateIsOpen: false,
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startDateIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.qParams = {} as ReportFeedbackSearchTerm;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.reportForm.patchValue(this.qParams);

                    if (!this.qParams.startDate) {
                        delete this.qParams.startDate;
                    }

                    if (!this.qParams.endDate) {
                        delete this.qParams.endDate;
                    }

                    return combineLatest(
                        this.reportSvc.getSearchResults(ReportType.FEEDBACK, this.qParams),
                        this.reportFeedbackSvc.getQuestionList(this.qParams)
                    ).pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                ([reportData, questions]) => {

                    this.questionList = questions;
                    this.reportData = <ReportData>reportData;

                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

        this.reportForm.get('responden').valueChanges
            .pipe(
                debounceTime(300),
                filter(responden => responden && responden.length >= this.lookup.minChar),
                distinctUntilChanged(),
                switchMap(responden => this.eventSvc.getNpk(responden))
            )
            .subscribe(employees => this.suggestion.employees = employees);

    }

    ngAfterViewChecked() {

        this.cdr.detectChanges();

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS'),
            this.feedbackSvc.getEventSuggestions(),
        )
            .subscribe(
                ([minChar, pageSize, events]) => {

                    this.lookup = {minChar, pageSize};
                    this.suggestion.events = events.map(event => event.itemName);

                },
                error => this.errorOnInit = {...error, type: 'ErrorResponse'}
            );

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.FEEDBACK, this.qParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-REPORT-FEEDBACK-(${new Date().getTime()}).xls`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                });

    }

    resetCalendar(formControlName: string): void {

        this.reportForm.get(formControlName).patchValue('');

    }

    searchByInput(): void {

        let startDate = this.reportForm.get('startDate').value;
        startDate = typeof startDate === 'object' ? startDate.format('YYYY-MM-DD') : startDate;

        let endDate = this.reportForm.get('endDate').value;
        endDate = typeof endDate === 'object' ? endDate.format('YYYY-MM-DD') : endDate;

        const term: ReportFeedbackSearchTerm = {...this.reportForm.getRawValue(), startDate, endDate};

        this.router.navigate(['/report/feedback'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.responseOnAction = undefined;

        this.uiState.searchIsPressed = true;

        if (this.invalidField(this.reportForm)) {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else {

            this.searchByInput();

        }

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.reportForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    checkEventSuggestion(evt: Event) {

        evt.preventDefault();

        let isValidEvent = true;

        if (this.suggestion && this.suggestion.events) {

            isValidEvent = this.suggestion.events
                .findIndex(event => event === this.reportForm.get('eventName').value) >= 0;

        }

        if (!isValidEvent) {
            this.reportForm.get('eventName').reset();
        }

    }

}
