import {ReportService} from '../../report/_service/report.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {CONTENT_RECEIVERS} from '../../content/_const/content.const';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {MAT_DATE_FORMATS} from '@angular/material';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {ClrDatagridStateInterface} from '@clr/angular';
import {Subject} from 'rxjs';
import {VideoSearchItem, VideoSearchTerm, VideoSuggestion} from '../_model/video.model';
import {VideoService} from '../_service/video.service';
import {debounceTime, distinctUntilChanged, tap, finalize, switchMap, filter} from 'rxjs/operators';
import {ReportType} from '../../report/_const/report-type.const';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';
import {SearchUtil} from '../../_util/search.util';

@Component({
    selector: 'fema-cms-video-search',
    templateUrl: './video-search.component.html',
    styleUrls: ['./video-search.component.scss'],
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
export class VideoSearchComponent implements OnInit, AfterViewChecked {

    categories: Array<{ value: string; label: string }>;
    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    videoForm: FormGroup;

    qParams: SearchPagination<VideoSearchTerm>;
    lookup: {
        minChar: number;
    };
    videoSearchList: PaginatedResponse<VideoSearchItem>;
    videoSuggestions: VideoSuggestion[];

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        uploadDateFromIsOpen: boolean;
        uploadDateToIsOpen: boolean;
    };

    get titleDatalist(): string {
        return this.videoForm.get('title').value.length >= this.lookup.minChar ? 'videoSuggestions' : '';
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<VideoSearchTerm>;

        if (this.qParams && this.videoSearchList.hasOwnProperty('dataList')) {

            term = {
                data: this.videoForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.videoSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/video/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private reportSvc: ReportService,
        private videoSvc: VideoService,
        private searchUtil: SearchUtil,
    ) {

        this.categories = STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS);

        this.videoForm = fb.group({
            title: '',
            category: '',
            uploadDateFrom: '',
            uploadDateTo: ''
        });

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.lookup = {
            minChar: 2,
        };

        this.videoSearchList = {} as PaginatedResponse<VideoSearchItem>;

        this.uiState = {
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            uploadDateFromIsOpen: false,
            uploadDateToIsOpen: false,
        };

    }

    ngOnInit() {

        this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR')
            .subscribe(
                minChar => this.lookup.minChar = minChar,
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

        this.videoForm.get('uploadDateFrom').valueChanges.subscribe(
            dateFrom => typeof dateFrom === 'string'
                ? dateFrom
                : this.videoForm.get('uploadDateFrom').patchValue(dateFrom.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.videoForm.get('uploadDateTo').valueChanges.subscribe(
            dateTo => typeof dateTo === 'string'
                ? dateTo
                : this.videoForm.get('uploadDateTo').patchValue(dateTo.format('YYYY-MM-DD'), {emitEvent: false})
        );

        this.videoForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(title => this.videoSvc.getVideoSuggestion(title))
            )
            .subscribe(videoSuggestions => this.videoSuggestions = videoSuggestions);

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);

                    this.videoForm.patchValue(this.qParams.data);

                    return this.videoSvc.searchVideoList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                videoSearchList => this.videoSearchList = videoSearchList,
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

        this.searchUtil.noSearchParams(this.videoForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        const reportParams = {
            title: this.videoForm.get('title').value,
            category: this.videoForm.get('category').value,
            startDate: this.videoForm.get('uploadDateFrom').value,
            endDate: this.videoForm.get('uploadDateTo').value
        };

        this.reportSvc.getDownloadUrl(ReportType.VIDEO_SEARCH, reportParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-VIDEO-SEARCH-(${new Date().getTime()}).xlsx`;
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

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.videoForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    resetCalendar(evt: Event, selector: string): void {

        this.videoForm.get(selector).patchValue('');

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<VideoSearchTerm> = {
            data: this.videoForm.getRawValue(),
            descending: false,
            orderBy: ['title'],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.videoForm.getRawValue())) {

                term = {
                    data: this.videoForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.uiState.searchModalIsOpen = false;

        this.router.navigate(['/video/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
