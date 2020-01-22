import {ContentSearchService} from './content-search.service';
import {SearchUtil} from '../../_util/search.util';
import {LookupService} from '../../lookup/_service/lookup.service';
import {Subject} from 'rxjs';
import {Router, ActivatedRoute} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CONTENT_RECEIVERS, CONTENT_TYPES} from '../_const/content.const';
import {ContentSearchItem, ContentSearchTerm, ContentSuggestion} from '../_model/content.model';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {ClrDatagridStateInterface} from '@clr/angular';
import {Validators} from '@angular/forms';
import {concatMap, debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import {ReportService} from '../../report/_service/report.service';
import {ReportType} from '../../report/_const/report-type.const';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-content-search',
    templateUrl: './content-search.component.html',
    styleUrls: ['./content-search.component.scss'],
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
export class ContentSearchComponent implements OnInit, AfterViewChecked {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    contentForm: FormGroup;

    contentTypes: Array<{ value: string; label: string }>;
    contentReceivers: Array<{ value: string; label: string }>;
    contentSuggestions: ContentSuggestion[];
    contentSearchList: PaginatedResponse<ContentSearchItem>;
    lookup: {
        minChar: number;
    };
    qParams: SearchPagination<ContentSearchTerm>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        endActivePeriodIsOpen: boolean;
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startActivePeriodIsOpen: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.contentSearchList && this.contentSearchList.dataList
            ? this.contentSearchList.dataList.length === 0 : true;
    }

    get titleDatalist(): string {
        return this.contentForm.get('title').value.length >= this.lookup.minChar ? 'contentSuggestions' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private formBuilder: FormBuilder,
        private contentSearchSvc: ContentSearchService,
        private lookupSvc: LookupService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService,
    ) {

        this.contentTypes = STANDARD_STRING_SELECTION.concat(CONTENT_TYPES);
        this.contentReceivers = STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS);

        this.contentForm = formBuilder.group({
            contentReceiverType: this.contentReceivers[0].value,
            contentSetupType: this.contentTypes[0].value,
            title: ['', [Validators.maxLength(30)]],
            startActivePeriod: '',
            endActivePeriod: ''
        });

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.contentSearchList = {} as PaginatedResponse<ContentSearchItem>;

        this.lookup = {
            minChar: 2
        };

        this.uiState = {
            endActivePeriodIsOpen: false,
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startActivePeriodIsOpen: false,
        };

    }

    ngOnInit() {

        this.contentForm.get('contentReceiverType').valueChanges.subscribe(
            receiver =>
                receiver === 'null'
                    ? this.contentForm.get('contentReceiverType').patchValue(null, {emitEvent: false})
                    : receiver
        );

        this.contentForm.get('contentSetupType').valueChanges.subscribe(
            setupType =>
                setupType === 'null'
                    ? this.contentForm.get('contentSetupType').patchValue(null, {emitEvent: false})
                    : setupType
        );

        this.contentForm.get('startActivePeriod').valueChanges.subscribe(
            startPeriod =>
                typeof startPeriod === 'string'
                    ? startPeriod
                    : this.contentForm
                        .get('startActivePeriod')
                        .patchValue(startPeriod.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.contentForm.get('endActivePeriod').valueChanges.subscribe(
            endPeriod =>
                typeof endPeriod === 'string'
                    ? endPeriod
                    : this.contentForm.get('endActivePeriod').patchValue(endPeriod.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.contentSearchList = {} as PaginatedResponse<ContentSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.contentForm.patchValue(this.qParams.data);

                    return this.contentSearchSvc.postContentList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                contentSearchList => this.contentSearchList = contentSearchList,
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

        this.contentForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(title => title && title.length >= this.lookup.minChar),
                concatMap(title => this.contentSearchSvc.getContentSuggestion(title))
            )
            .subscribe(contentSuggestions => this.contentSuggestions = contentSuggestions);

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

        this.searchUtil.noSearchParams(this.contentForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        const reportParams = {
            contentReceiverType: this.contentForm.get('contentReceiverType').value,
            contentSetupType: this.contentForm.get('contentSetupType').value,
            title: this.contentForm.get('title').value,
            startDate: this.contentForm.get('startActivePeriod').value,
            endDate: this.contentForm.get('endActivePeriod').value
        };

        this.reportSvc.getDownloadUrl(ReportType.CONTENT_SEARCH, reportParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-CONTENT-SEARCH-(${new Date().getTime()}).xlsx`;
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

        this.lookupSvc
            .getLookupDetailMeaning('GLOBAL_SETUP~MIN_CHAR')
            .subscribe(
                minChar => this.lookup.minChar = minChar,
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                });

    }

    resetCalendar(evt: Event, selector: string): void {

        evt.preventDefault();

        this.contentForm.get(selector).patchValue('');

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<ContentSearchTerm> = {
            data: this.contentForm.getRawValue(),
            descending: false,
            orderBy: [],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.contentForm.getRawValue())) {

                term = {
                    data: this.contentForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.uiState.searchModalIsOpen = false;

        this.router.navigate(['/content/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<ContentSearchTerm>;

        if (this.qParams && this.contentSearchList.hasOwnProperty('dataList')) {

            term = {
                data: this.contentForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.contentSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/content/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
