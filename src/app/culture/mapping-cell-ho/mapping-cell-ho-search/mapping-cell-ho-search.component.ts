import {debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, tap} from 'rxjs/operators';
import {MappingHOTerm, MappingHoSearchItem} from '../_model/mapping-cell-ho.model';
import {combineLatest, Subject} from 'rxjs';
import {ClrDatagridStateInterface} from '@clr/angular';
import {SearchUtil} from '../../../_util/search.util';
import {LookupService} from '../../../lookup/_service/lookup.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MappingHOService} from '../_service/mapping-ho.service';
import {ReportService} from '../../../report/_service/report.service';
import {ReportType} from '../../../report/_const/report-type.const';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-mapping-cell-ho-search',
    templateUrl: './mapping-cell-ho-search.component.html',
    styleUrls: ['./mapping-cell-ho-search.component.scss']
})
export class MappingCellHoSearchComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    cultureForm: FormGroup;

    qParams: SearchPagination<MappingHOTerm>;
    hoSearchList: PaginatedResponse<MappingHoSearchItem>;
    lookup: {
        minChar: number;
        pageSize: number;
    };
    suggestion: {
        cells: string[],
        orgs: string[],
    };

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        cancelModalIsOpen: boolean;
        cancelFailModalIsOpen: boolean;
        cancelSuccessModalIsOpen: boolean;
        closeModalIsOpen: boolean;
        closeFailModalIsOpen: boolean;
        closeSuccessModalIsOpen: boolean;
        endDateIsOpen: boolean;
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateIsOpen: boolean;
    };

    get cellNameDatalist(): string {
        return this.cultureForm.get('cellName').value.length >= this.lookup.minChar ? 'hoSuggestion' : '';
    }

    get downloadIsDisabled(): boolean {
        return this.hoSearchList && this.hoSearchList.dataList
            ? this.hoSearchList.dataList.length === 0 : true;
    }

    get organizationDatalist(): string {
        return this.cultureForm.get('organization').value.length >= this.lookup.minChar ? 'orgSuggestion' : '';
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<MappingHOTerm>;

        if (this.qParams && this.hoSearchList.hasOwnProperty('dataList')) {

            term = {
                data: this.cultureForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.hoSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/culture/mapping-ho/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private hoSvc: MappingHOService,
        private lookupService: LookupService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService
    ) {

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.cultureForm = fb.group({
            cellName: '',
            organization: '',
        });

        this.hoSearchList = {} as PaginatedResponse<MappingHoSearchItem>;

        this.lookup = {
            minChar: 0,
            pageSize: 10
        };

        this.uiState = {
            cancelModalIsOpen: false,
            cancelFailModalIsOpen: false,
            cancelSuccessModalIsOpen: false,
            closeModalIsOpen: false,
            closeFailModalIsOpen: false,
            closeSuccessModalIsOpen: false,
            endDateIsOpen: false,
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            startDateIsOpen: false,
            searchModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.hoSearchList = {} as PaginatedResponse<MappingHoSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(({q}) => {

                    this.uiState.searchIsPressed = true;

                    this.qParams = JSON.parse(q);

                    this.cultureForm.patchValue(this.qParams.data);

                    return this.hoSvc.searchHoList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                hoSearchList => this.hoSearchList = hoSearchList,
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

        this.searchUtil.noSearchParams(this.cultureForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();
    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.CULTURE_MAPPING_CELL_HO, this.qParams.data)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-CULTURE-HO-SEARCH-(${new Date().getTime()}).xlsx`;
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

        combineLatest(
            this.lookupService.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupService.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS'),
            this.hoSvc.getOrganizationSuggestions(),
            this.hoSvc.getHoSuggestions(),
        )
            .pipe(
                map(([minChar, pageSize, orgs, hos]) => ({
                    lookup: {minChar, pageSize},
                    suggestion: {
                        orgs: orgs.map(org => org.orgName),
                        cells: hos,
                    },
                }))
            )
            .subscribe(
                ({lookup, suggestion}) => {
                    this.lookup = lookup;
                    this.suggestion = suggestion;
                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    searchByInput(): void {

        this.uiState.searchModalIsOpen = false;

        let term: SearchPagination<MappingHOTerm> = {
            data: this.cultureForm.getRawValue(),
            descending: false,
            orderBy: [],
            currentPage: 1,
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.cultureForm.getRawValue())) {

                term = {
                    data: this.cultureForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage,
                };

            }

        }

        this.router.navigate(['/culture/mapping-ho/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
