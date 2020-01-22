import {API_RESOURCE_REPORT_LOGO} from '../../_const/api.const';
import {ReportBeritaAcaraService} from './report-berita-acara.service';
import {ReportBeritaAcaraSearchTerm, ReportBeritaAcara} from './report-berita-acara.model';
import {SearchUtil} from '../../_util/search.util';
import {ReportService} from '../_service/report.service';
import {LookupService} from '../../lookup/_service/lookup.service';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild} from '@angular/core';
import {MAT_DATE_FORMATS} from '@angular/material';
import {tap, debounceTime, distinctUntilChanged, finalize, switchMap, filter, map} from 'rxjs/operators';
import {Subject, combineLatest, Observable} from 'rxjs';
import {ReportType} from '../_const/report-type.const';
import {ClrDatagridStateInterface} from '@clr/angular';
import {CounterpartService} from '../../culture/counterpart/_service/counterpart.service';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import * as moment from 'moment';

@Component({
    selector: 'fema-cms-report-berita-acara',
    templateUrl: './report-berita-acara.component.html',
    styleUrls: ['./report-berita-acara.component.scss'],
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
export class ReportBeritaAcaraComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    currentDate: Date;
    reportForm: FormGroup;
    srcImage: string;

    attachments: Array<{
        id: string;
        imageLocation: string;
    }>;
    lookup: {
        minChar: number;
        pageSize: number;
    };
    option: {
        categories: Array<{ value: string, label: string }>;
        counterparts: Array<{ value: string, label: string }>;
    };
    qParams: SearchPagination<ReportBeritaAcaraSearchTerm>;
    reportBeritaAcara: PaginatedResponse<ReportBeritaAcara>;
    suggestion: {
        cells: string[];
    };

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        attachmentIsDownloading: boolean;
        attachmentIsOpen: boolean;
        attachmentIsOpening: boolean;
        attachmentSuccessIsOpen: boolean;
        endDateIsOpen: boolean;
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateIsOpen: boolean;
    };

    get cellDatalist(): string {
        return this.reportForm.get('cell').value.length >= this.lookup.minChar ? 'cellSuggestion' : '';
    }

    get downloadIsDisabled(): boolean {
        return this.reportBeritaAcara && this.reportBeritaAcara.dataList ? this.reportBeritaAcara.dataList.length === 0 : true;
    }

    set resetCalendar(formControlName: string) {
        this.reportForm.get(formControlName).patchValue('');
    }

    private cellAreas(): Observable<string[]> {

        return this.counterpartSvc.getCellAreas().pipe(
            map(cellAreas => cellAreas.flatMap(cellArea => cellArea.cell).map(cell => cell.name))
        );

    }

    private counterpartNameSuggestions(): Observable<Array<{ value: string, label: string }>> {

        return this.counterpartSvc.getNameSuggestions().pipe(
            map(suggestions => suggestions
                ? Object.entries(suggestions).map(suggestion => ({label: suggestion[1], value: suggestion[0]}))
                : []
            )
        );

    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private beritaAcaraSvc: ReportBeritaAcaraService,
        private counterpartSvc: CounterpartService,
        private lookupSvc: LookupService,
        private reportSvc: ReportService,
        private searchUtil: SearchUtil,
    ) {

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.currentDate = new Date();

        this.attachments = [];

        this.option = {
            categories: STANDARD_STRING_SELECTION.concat([
                {
                    label: 'Culture Day',
                    value: 'CULTURE'
                },
                {
                    label: 'Implementation',
                    value: 'IMPLEMENTATION'
                }
            ]),
            counterparts: STANDARD_STRING_SELECTION
        };

        this.reportForm = fb.group({
            category: '',
            counterPart: this.option.counterparts[0],
            cell: '',
            startDate: '',
            endDate: '',
        });

        this.srcImage = `${API_RESOURCE_REPORT_LOGO}/fifgroup_logo.png`;

        this.lookup = {
            minChar: 2,
            pageSize: 20
        };

        this.suggestion = {
            cells: []
        };

        this.uiState = {
            attachmentIsDownloading: false,
            attachmentIsOpen: false,
            attachmentIsOpening: false,
            attachmentSuccessIsOpen: false,
            endDateIsOpen: false,
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startDateIsOpen: false
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.reportForm.get('category').valueChanges
            .pipe(
                switchMap(category => {

                    if (category === 'CULTURE') {
                        this.reportForm.get('counterPart').disable();
                        this.reportForm.get('counterPart').setValue(this.option.counterparts[0]);
                    } else {
                        this.reportForm.get('counterPart').enable();
                    }

                    return this.cellAreas();

                })
            )
            .subscribe(cells => this.suggestion.cells = cells);

        this.reportForm.get('counterPart').valueChanges
            .pipe(
                filter(counterPart => counterPart && counterPart.value),
                distinctUntilChanged((a, b) => a.value === b.value),
                switchMap(counterPart => this.getCellAreasById(counterPart.value))
            )
            .subscribe(cells => this.suggestion.cells = cells);

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.reportBeritaAcara = {} as PaginatedResponse<ReportBeritaAcara>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.reportForm.patchValue({
                        ...this.qParams,
                        data: {
                            ...this.qParams.data,
                            startDate: this.qParams.data.startDate ? moment(this.qParams.data.startDate) : '',
                            endDate: this.qParams.data.endDate ? moment(this.qParams.data.endDate) : ''
                        }
                    });

                    return this.beritaAcaraSvc.search(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(reportBeritaAcara => this.reportBeritaAcara = reportBeritaAcara);

        this.clrPage.pipe(
            debounceTime(300),
            distinctUntilChanged((prevState, currentState) => JSON.stringify(prevState) === JSON.stringify(currentState))
        ).subscribe(state => this.searchByPagination(state));

    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<ReportBeritaAcaraSearchTerm>;

        if (this.qParams && this.reportBeritaAcara.hasOwnProperty('dataList')) {

            term = {
                data: {
                    ...this.reportForm.getRawValue(),
                    counterPart: this.reportForm.get('counterPart').value.value ? this.reportForm.get('counterPart').value.label : '',
                    endDate: typeof(this.reportForm.get('endDate').value) === 'object'
                        ? this.reportForm.get('endDate').value.format('YYYY-MM-DD') : '',
                    startDate: typeof(this.reportForm.get('startDate').value) === 'object'
                        ? this.reportForm.get('startDate').value.format('YYYY-MM-DD') : ''
                },
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.reportBeritaAcara.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/report/berita-acara'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS'),
            this.counterpartNameSuggestions(),
        )
            .subscribe(
                ([minChar, pageSize, counterparts]) => {

                    this.lookup = {minChar, pageSize};
                    this.option.counterparts = this.option.counterparts.concat(counterparts);

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    getCellAreasById(id: string): Observable<string[]> {

        return this.counterpartSvc.getById(id).pipe(
            map(counterpart => counterpart.areaCell.flatMap(cellArea => cellArea.cell).map(cell => cell.name))
        );

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        const param = this.qParams.data;

        if (!this.qParams.data.startDate) {

            delete param.startDate;

        }

        if (!this.qParams.data.endDate) {

            delete param.endDate;

        }

        this.reportSvc.getDownloadUrl(ReportType.BERITA_ACARA, param)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-REPORT-BERITA-ACARA-(${new Date().getTime()}).xls`;
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

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        this.searchUtil.noSearchParams(this.reportForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.reportForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    openFileAttachmentModal(evt: Event, id: string): void {

        evt.preventDefault();

        this.uiState.attachmentIsOpening = true;

        this.beritaAcaraSvc.getById(id)
            .pipe(
                finalize(() => this.uiState.attachmentIsOpening = false),
                map(reportActivity => reportActivity.attachments)
            )
            .subscribe(
                attachments => {

                    this.uiState.attachmentIsOpen = true;
                    this.attachments = attachments;

                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    downloadAttachment(evt: Event, url: string): void {

        evt.preventDefault();

        this.uiState.attachmentIsDownloading = false;

        this.beritaAcaraSvc.downloadAttachment(url)
            .pipe(finalize(() => this.uiState.attachmentIsDownloading = false))
            .subscribe(
                attachmentUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = attachmentUrl.substring(attachmentUrl.lastIndexOf('/') + 1);
                    aEle.href = attachmentUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<ReportBeritaAcaraSearchTerm> = {
            data: {
                ...this.reportForm.getRawValue(),
                counterPart: this.reportForm.get('counterPart').value.value ? this.reportForm.get('counterPart').value.label : '',
                endDate: typeof(this.reportForm.get('endDate').value) === 'object'
                    ? this.reportForm.get('endDate').value.format('YYYY-MM-DD') : '',
                startDate: typeof(this.reportForm.get('startDate').value) === 'object'
                    ? this.reportForm.get('startDate').value.format('YYYY-MM-DD') : ''
            },
            descending: false,
            orderBy: [],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(term)) {

                term = {
                    ...term,
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.uiState.searchModalIsOpen = false;

        this.router.navigate(
            ['/report/berita-acara'],
            {
                queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
                queryParamsHandling: 'merge'
            }
        ).then();

    }

}
