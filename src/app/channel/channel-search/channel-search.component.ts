import {ReportService} from '../../report/_service/report.service';
import {SearchUtil} from '../../_util/search.util';
import {ClrDatagridStateInterface} from '@clr/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ChannelSearchItem, ChannelSearchTerm, ChannelSuggestion} from '../_model/channel.model';
import {ChannelService} from '../_service/channel.service';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {MAT_DATE_FORMATS} from '@angular/material';
import {Subject} from 'rxjs';
import {debounceTime, filter, switchMap, tap, finalize, distinctUntilChanged} from 'rxjs/operators';
import {ReportType} from '../../report/_const/report-type.const';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-channel-search',
    templateUrl: './channel-search.component.html',
    styleUrls: ['./channel-search.component.scss'],
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
export class ChannelSearchComponent implements OnInit, AfterViewChecked {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    channelForm: FormGroup;
    clrPage: Subject<ClrDatagridStateInterface>;

    channelList: PaginatedResponse<ChannelSearchItem>;
    channelSuggestions: ChannelSuggestion[];
    lookup: {
        minChar: number;
    };
    qParams: SearchPagination<ChannelSearchTerm>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        createDateFromIsOpen: boolean;
        createDateToIsOpen: boolean;
        isSearching: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        reportIsDownloading: boolean;
    };

    get channelDatalist(): string {
        return this.channelForm.get('channel').value.length >= this.lookup.minChar ? 'channelSuggestions' : '';
    }

    get downloadIsDisabled(): boolean {
        return this.channelList && this.channelList.dataList
            ? this.channelList.dataList.length === 0 : true;
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<ChannelSearchTerm>;

        if (this.qParams && this.channelList.hasOwnProperty('dataList')) {

            term = {
                data: this.channelForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.channelList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/channel/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private channelSvc: ChannelService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService,
    ) {

        this.channelForm = formBuilder.group({
            channel: ['', Validators.maxLength(50)],
            createDateFrom: '',
            createDateTo: ''
        });

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.channelList = {} as PaginatedResponse<ChannelSearchItem>;

        this.lookup = {
            minChar: 2
        };

        this.uiState = {
            createDateFromIsOpen: false,
            createDateToIsOpen: false,
            isSearching: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            reportIsDownloading: false,
        };

    }

    ngOnInit() {

        this.channelForm.get('channel').valueChanges
            .pipe(
                filter(channel => channel && channel.length > 0),
                switchMap(channel => this.channelSvc.getChannelSuggestion(channel))
            )
            .subscribe(channelSuggestion => this.channelSuggestions = channelSuggestion);

        this.channelForm.get('createDateFrom').valueChanges.subscribe(dateFrom =>
            typeof dateFrom === 'string'
                ? dateFrom
                : this.channelForm.get('createDateFrom').patchValue(dateFrom.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.channelForm.get('createDateTo').valueChanges.subscribe(dateTo =>
            typeof dateTo === 'string'
                ? dateTo
                : this.channelForm.get('createDateTo').patchValue(dateTo.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.channelList = {} as PaginatedResponse<ChannelSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.channelForm.patchValue(this.qParams.data);

                    return this.channelSvc.postChannelSearchList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                channelList => this.channelList = channelList,
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

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        this.searchUtil.noSearchParams(this.channelForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        const reportParams = {
            channel: this.channelForm.get('channel').value,
            startDate: this.channelForm.get('createDateFrom').value,
            endDate: this.channelForm.get('createDateTo').value
        };

        this.reportSvc.getDownloadUrl(ReportType.CHANNEL_SEARCH, reportParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-CHANNEL-SEARCH-(${new Date().getTime()}).xlsx`;
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

    initialSetup(): void {

        this.lookupSvc.getLookupDetailMeaning('GLOBAL_SETUP~MIN_CHAR')
            .subscribe(minChar => this.lookup.minChar = minChar);

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.channelForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    resetCalendar(evt: Event, selector: string): void {

        evt.preventDefault();

        this.channelForm.get(selector).patchValue('');

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<ChannelSearchTerm> = {
            data: this.channelForm.getRawValue(),
            descending: false,
            orderBy: ['channel'],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.channelForm.getRawValue())) {

                term = {
                    data: this.channelForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.router.navigate(['/channel/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
