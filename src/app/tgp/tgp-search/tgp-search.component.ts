import {ActivatedRoute, Router} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DATE_FORMATS} from '@angular/material';
import {SearchUtil} from '../../_util/search.util';
import {ClrDatagridStateInterface} from '@clr/angular';
import {Subject} from 'rxjs';
import {TgpSearchItem, TgpSearchTerm} from './tgp-search.model';
import {TgpSearchService} from './tgp-search.service';
import {ReportService} from '../../report/_service/report.service';
import {ReportType} from '../../report/_const/report-type.const';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-tgp-search',
    templateUrl: './tgp-search.component.html',
    styleUrls: ['./tgp-search.component.scss'],
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
export class TgpSearchComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    currentDate: string;
    tgpForm: FormGroup;
    tgp: TgpSearchTerm;

    lookup: {
        pageSize: number;
    };
    qParams: SearchPagination<TgpSearchTerm>;
    tgpSearchList: PaginatedResponse<TgpSearchItem>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        downloadModalIsOpen: boolean;
        cancelModalIsOpen: boolean;
        cancelFailModalIsOpen: boolean;
        cancelSuccessModalIsOpen: boolean;
        closeModalIsOpen: boolean;
        closeFailModalIsOpen: boolean;
        closeSuccessModalIsOpen: boolean;
        endDateIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateIsOpen: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.tgpSearchList && this.tgpSearchList.dataList
            ? this.tgpSearchList.dataList.length === 0 : true;
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<TgpSearchTerm>;

        if (this.qParams && this.tgpSearchList.hasOwnProperty('dataList')) {

            term = {
                ...({} as SearchPagination<TgpSearchTerm>),
                data: this.tgpForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.tgpSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(
            ['/tgp/search'],
            {
                queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
                queryParamsHandling: 'merge'
            }
        ).then();

    }

    constructor(
        private ar: ActivatedRoute,
        fb: FormBuilder,
        private router: Router,
        private tgpSearchSvc: TgpSearchService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService
    ) {

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.currentDate = new Date().toISOString().split('T')[0];

        this.tgpForm = fb.group({
            startDate: '',
            endDate: '',
        });

        this.tgpSearchList = {} as PaginatedResponse<TgpSearchItem>;

        this.uiState = {
            downloadModalIsOpen: false,
            cancelModalIsOpen: false,
            cancelFailModalIsOpen: false,
            cancelSuccessModalIsOpen: false,
            closeModalIsOpen: false,
            closeFailModalIsOpen: false,
            closeSuccessModalIsOpen: false,
            endDateIsOpen: false,
            failedRecordIsDownloading: false,
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            startDateIsOpen: false,
            searchModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.tgpForm.get('startDate').valueChanges.subscribe(startDate => {
            if (typeof startDate !== 'string') {
                this.tgpForm.get('startDate').patchValue(startDate.format('YYYY-MM-DD'), {emitEvent: false});
            }
        });

        this.tgpForm.get('endDate').valueChanges.subscribe(endDate => {
            if (typeof endDate !== 'string') {
                this.tgpForm.get('endDate').patchValue(endDate.format('YYYY-MM-DD'), {emitEvent: false});
            }
        });

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.tgpSearchList = {} as PaginatedResponse<TgpSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);

                    this.tgpForm.patchValue(this.qParams.data);

                    return this.tgpSearchSvc.searchTgpList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                tgpSearchList => this.tgpSearchList = tgpSearchList,
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

        this.searchUtil.noSearchParams(this.tgpForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    cancelTgp(id: string): void {

        this.tgpSearchSvc.cancelTgp(id)
            .pipe(tap(() => this.searchByInput()))
            .subscribe(
                () => this.uiState.cancelSuccessModalIsOpen = true,
                error => {

                    this.uiState.cancelFailModalIsOpen = true;
                    this.responseOnAction = {...error, type: 'ErrorResponse'};

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                }
            );

    }

    closeTgp(): void {

        this.tgpSearchSvc.closeTgp()
            .pipe(tap(() => this.searchByInput()))
            .subscribe(
                () => this.uiState.closeSuccessModalIsOpen = true,
                error => {

                    this.uiState.closeFailModalIsOpen = true;
                    this.responseOnAction = {...error, type: 'ErrorResponse'};

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                }
            );

    }

    downloadFailedRecord(tgp): void {

        if (+tgp.totalFailedRecord > 0) {

            this.uiState.failedRecordIsDownloading = true;

            this.tgpSearchSvc.getFailedRecord(tgp.id)
                .pipe(finalize(() => this.uiState.failedRecordIsDownloading = false))
                .subscribe(
                    url => {

                        const aEle: ElementRef['nativeElement'] = document.createElement('a');

                        document.body.appendChild(aEle);

                        aEle.style = 'display: none';
                        aEle.download = `FEMA-TGP-FAILED-RECORD-(${tgp.id}).xls`;
                        aEle.href = url;

                        aEle.click();

                        URL.revokeObjectURL(url);

                    },
                    error => {
                        this.responseOnAction = {...error, type: 'ErrorResponse'};
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                );

        }

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        const noPeriod: boolean =
            !this.tgpForm.get('startDate').value && !this.tgpForm.get('endDate').value
            || !this.tgpForm.get('startDate').value
            || !this.tgpForm.get('endDate').value;

        this.reportSvc.getDownloadUrl(ReportType.TGP_SEARCH, noPeriod ? {} as TgpSearchItem : this.qParams.data)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-TGP-SEARCH-(${new Date().getTime()}).xlsx`;
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

    resetCalendar(selector: string): void {

        this.tgpForm.get(selector).patchValue('');

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<TgpSearchTerm> = {
            data: this.tgpForm.getRawValue(),
            descending: false,
            orderBy: [],
            currentPage: 1,
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.tgpForm.getRawValue())) {

                term = {
                    data: this.tgpForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage,
                };

            }

        }

        this.router.navigate(
            ['/tgp/search'],
            {
                queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
                queryParamsHandling: 'merge'
            }).then();

    }

}
