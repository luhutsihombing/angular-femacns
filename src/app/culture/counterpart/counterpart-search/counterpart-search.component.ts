import {LookupService} from '../../../lookup/_service/lookup.service';
import {OnInit, Component, ElementRef, ViewChild, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {SearchUtil} from '../../../_util/search.util';
import {combineLatest, Subject} from 'rxjs';
import {ClrDatagridStateInterface} from '@clr/angular';
import {CounterpartSearchItem, CounterpartSearchTerm} from '../_model/counterpart.model';
import {CounterpartService} from '../_service/counterpart.service';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {ReportType} from '../../../report/_const/report-type.const';
import {ReportService} from '../../../report/_service/report.service';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-counterpart-search',
    templateUrl: './counterpart-search.component.html',
    styleUrls: ['./counterpart-search.component.scss']
})
export class CounterpartSearchComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    cpForm: FormGroup;

    cpSearchList: PaginatedResponse<CounterpartSearchItem>;
    lookup: {
        minChar: number;
    };
    suggestion: {
        employees: string[];
        areas: string[];
        cells: string[];
    };
    qParams: SearchPagination<CounterpartSearchTerm>;

    cpId: string;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        viewAreaModalIsOpen: boolean;
    };

    get areaNameDatalist(): string {
        return this.cpForm.get('areaName').value.length >= this.lookup.minChar ? 'areaSuggestion' : '';
    }

    get cellNameDatalist(): string {
        return this.cpForm.get('cellName').value.length >= this.lookup.minChar ? 'cellSuggestion' : '';
    }

    get counterpartNameDatalist(): string {
        return this.cpForm.get('counterpartName').value.length >= this.lookup.minChar ? 'employeeSuggestion' : '';
    }

    get downloadIsDisabled(): boolean {
        return this.cpSearchList && this.cpSearchList.dataList
            ? this.cpSearchList.dataList.length === 0 : true;
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<CounterpartSearchTerm>;

        const [counterpartNumber, counterpartName] = this.cpForm.get('counterpartName').value
            ? this.cpForm.get('counterpartName').value.split('~')
            : ['', ''];

        const data: CounterpartSearchTerm = {
            ...this.cpForm.getRawValue(),
            counterpartNumber,
            counterpartName,
        };

        if (this.qParams && this.cpSearchList.hasOwnProperty('dataList')) {

            term = {
                data,
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.cpSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/culture/counterpart/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private router: Router,
        private cpSvc: CounterpartService,
        private lookupService: LookupService,
        private reportSvc: ReportService,
        private searchUtil: SearchUtil,
    ) {

        this.cpForm = formBuilder.group({
            counterpartName: '',
            areaName: '',
            cellName: ''
        });

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.cpSearchList = {} as PaginatedResponse<CounterpartSearchItem>;
        this.lookup = {
            minChar: 2,
        };

        this.suggestion = {
            employees: [],
            areas: [],
            cells: [],
        };

        this.uiState = {
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            viewAreaModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.cpSearchList = {} as PaginatedResponse<CounterpartSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false
                    };

                }),
                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);

                    const counterpartName: string =
                        this.qParams.data.counterpartName && this.qParams.data.counterpartNumber
                            ? this.qParams.data.counterpartNumber.concat('~'.concat(this.qParams.data.counterpartName))
                            : '';

                    this.cpForm.patchValue({...this.qParams.data, counterpartName});

                    return this.cpSvc.postCounterpartList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                cpSearchList => this.cpSearchList = cpSearchList,
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

        this.searchUtil.noSearchParams(this.cpForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.CULTURE_COUNTERPART, {
            ...this.qParams.data,
            counterPartName: this.qParams.data.counterpartName
        })
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-CULTURE-COUNTERPART-SEARCH-(${new Date().getTime()}).xlsx`;
                    aEle.href = reportUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                });

    }

    searchByInput(): void {

        this.responseOnAction = null;

        const [counterpartNumber, counterpartName] = this.cpForm.get('counterpartName').value
            ? this.cpForm.get('counterpartName').value.split('~')
            : ['', ''];

        const data: CounterpartSearchTerm = {
            ...this.cpForm.getRawValue(),
            counterpartNumber,
            counterpartName,
        };

        let term: SearchPagination<CounterpartSearchTerm> = {
            data,
            descending: false,
            orderBy: [],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.cpForm.getRawValue())) {

                term = {
                    data,
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage

                };

            }

        }

        this.router.navigate(['/culture/counterpart/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    checkAreaSuggestion(evt: Event, controlName: string | string[]) {

        evt.preventDefault();

        if (this.suggestion.areas.length > 0) {

            const suggestionDoesNotExist: boolean = this.suggestion.areas
                .findIndex(area => `${area}` === this.cpForm.get(controlName).value) === -1;

            if (suggestionDoesNotExist) {

                this.cpForm.get(controlName).patchValue('', {emitEvent: false});

            }

        }

    }

    checkCellSuggestion(evt: Event, controlName: string | string[]) {

        evt.preventDefault();

        if (this.suggestion.cells) {

            const suggestionDoesNotExist: boolean = this.suggestion.cells
                .findIndex(cell => `${cell}` === this.cpForm.get(controlName).value) === -1;

            if (suggestionDoesNotExist) {

                this.cpForm.get(controlName).patchValue('', {emitEvent: false});

            }

        }

    }

    checkEmployeeSuggestion(evt: Event, controlName: string | string[]) {

        evt.preventDefault();

        if (this.suggestion.employees) {

            const suggestionDoesNotExist: boolean = this.suggestion.employees
                .map(employee => `${employee}`.split('-').join('~'))
                .findIndex(employee => employee === this.cpForm.get(controlName).value) === -1;

            if (suggestionDoesNotExist) {

                this.cpForm.get(controlName).patchValue('', {emitEvent: false});

            }

        }

    }

    initialSetup(): void {

        combineLatest(
            this.lookupService.getLookupDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.cpSvc.getAreaSuggestions(),
            this.cpSvc.getCellAreas(),
            this.cpSvc.getActiveEmployeeSuggestions()
        )
            .subscribe(
                ([minChar, areas, cellAreas, employees]) => {

                    this.lookup.minChar = minChar;

                    this.suggestion = {
                        ...this.suggestion,
                        areas,
                        cells: cellAreas.flatMap(cellArea => cellArea.cell).map(cell => cell.name),
                        employees
                    };

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    openViewAreaModal(evt: Event, id: string): void {

        if (evt) {
            evt.preventDefault();
        }

        this.uiState.viewAreaModalIsOpen = true;

        this.cpId = id;

    }

}
