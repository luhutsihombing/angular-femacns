import {ReportService} from '../../report/_service/report.service';
import {SearchUtil} from '../../_util/search.util';
import {ActivatedRoute, Router} from '@angular/router';
import {EventSearchTerm, EventSearchItem, EventDetailItem} from '../_model/event.model';
import {EventService} from '../_service/event.service';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ClrDatagridStateInterface} from '@clr/angular';
import {MAT_DATE_FORMATS} from '@angular/material';
import {Subject} from 'rxjs';
import {debounceTime, tap, finalize, switchMap, distinctUntilChanged, filter} from 'rxjs/operators';
import {ReportType} from '../../report/_const/report-type.const';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-event-search',
    templateUrl: './event-search.component.html',
    styleUrls: ['./event-search.component.scss'],
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
export class EventSearchComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    eventForm: FormGroup;

    eventDetail: EventDetailItem;
    eventDetailParams: EventDetailItem;
    eventId: string;
    eventSearchList: PaginatedResponse<EventSearchItem>;
    qParams: SearchPagination<EventSearchTerm>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        detailModalIsOpen: boolean;
        endDateIsOpen: boolean;
        isSearching: boolean;
        reminderFailModalIsOpen: boolean;
        reminderModalIsOpen: boolean;
        reminderSuccessModalIsOpen: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateIsOpen: boolean;
    };

    readonly startDateIsNotPassed = (date: string): boolean => new Date(date) > new Date()
        && date !== new Date().toISOString().split('T')[0];

    get downloadIsDisabled(): boolean {
        return this.eventSearchList && this.eventSearchList.dataList ?
            this.eventSearchList.dataList.length === 0 : true;
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<EventSearchTerm>;

        if (this.qParams && this.eventSearchList.hasOwnProperty('dataList')) {

            term = {
                data: this.eventForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.eventSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/event/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    constructor(
        private ar: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private eventSvc: EventService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService
    ) {

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.eventForm = formBuilder.group({
            eventName: [''],
            category: [''],
            type: [''],
            startDate: [''],
            endDate: ['']
        });

        this.eventDetail = {} as EventDetailItem;

        this.eventSearchList = {} as PaginatedResponse<EventSearchItem>;

        this.uiState = {
            detailModalIsOpen: false,
            endDateIsOpen: false,
            isSearching: false,
            reminderFailModalIsOpen: false,
            reminderModalIsOpen: false,
            reminderSuccessModalIsOpen: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startDateIsOpen: false,
        };

    }

    ngOnInit() {

        this.eventForm.get('eventName').valueChanges.subscribe(eventName =>
            eventName === ''
                ? this.eventForm.get('eventName').patchValue('', {emitEvent: false})
                : eventName
        );

        this.eventForm.get('category').valueChanges.subscribe(category =>
            category === ''
                ? this.eventForm.get('category').patchValue('', {emitEvent: false})
                : category
        );

        this.eventForm.get('type').valueChanges.subscribe(type =>
            type === ''
                ? this.eventForm.get('type').patchValue('', {emitEvent: false})
                : type
        );

        this.eventForm.get('startDate').valueChanges.subscribe(startDate =>
            typeof startDate === 'string'
                ? startDate
                : this.eventForm.get('startDate').patchValue(startDate.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.eventForm.get('endDate').valueChanges.subscribe(endDate =>
            typeof endDate === 'string'
                ? endDate
                : this.eventForm.get('endDate').patchValue(endDate.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.eventSearchList = {} as PaginatedResponse<EventSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        searchIsPressed: false,
                        isSearching: true,
                    };

                }),
                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);

                    this.eventForm.patchValue(this.qParams.data);

                    return this.eventSvc.searchEventList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                eventSearchList => this.eventSearchList = eventSearchList,
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

        this.clrPage.pipe(
            debounceTime(300),
            distinctUntilChanged((prevState, currentState) => JSON.stringify(prevState) === JSON.stringify(currentState))
        ).subscribe(state => this.searchByPagination(state));

    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        this.searchUtil.noSearchParams(this.eventForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.EVENT_SEARCH, this.eventForm.getRawValue())
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-EVENT-SEARCH-(${new Date().getTime()}).xlsx`;
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

    downloadDetailEventReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.eventSvc.postDownloadUrl(this.eventDetailParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-EVENT-KNOWLEDGE-SHARING-DETAIL-(${new Date().getTime()}).xlsx`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                });

    }

    downloadKnowledgeSharing(id): void {

        this.eventSvc.postDownloadTotalAttend(id)
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-EVENT-TOTAL-ATTEND-(${new Date().getTime()}).xlsx`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                });

    }

    downloadSurveyOther(id): void {

        this.eventSvc.postDownloadTotalAttendSurvey(id)
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-EVENT-TOTAL-ATTEND-(${new Date().getTime()}).xlsx`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                });

    }

    openDetail(param: string): void {

        this.eventSvc.getDetailsEventId(param)
            .pipe(finalize(() => this.uiState.detailModalIsOpen = true))
            .subscribe(
                eventDetail => {

                    this.eventDetailParams = eventDetail;

                    this.eventDetail = {
                        ...eventDetail,
                        materialAndSpeakers: eventDetail.materialAndSpeakers.length > 0 ? JSON.parse(
                            JSON.stringify(eventDetail.materialAndSpeakers)
                                .replace(/\s(?=\w+":)/g, '')) : eventDetail.materialAndSpeakers
                    };


                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    openReminderModal(evt: Event, id: string): void {

        evt.preventDefault();

        this.uiState.reminderModalIsOpen = true;
        this.eventId = id;

    }

    resetCalendar(evt: Event, selector: string): void {

        evt.preventDefault();

        this.eventForm.get(selector).patchValue('');

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<EventSearchTerm> = {
            data: this.eventForm.getRawValue(),
            descending: false,
            orderBy: [],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.eventForm.getRawValue())) {

                term = {
                    data: this.eventForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.router.navigate(['/event/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    sendReminder(id: string): void {

        this.eventSvc.getSendReminder(id.toString())
            .pipe(finalize(() => this.uiState.reminderModalIsOpen = false))
            .subscribe(
                () => this.uiState.reminderSuccessModalIsOpen = true,
                () => this.uiState.reminderFailModalIsOpen = true
            );

    }

}
