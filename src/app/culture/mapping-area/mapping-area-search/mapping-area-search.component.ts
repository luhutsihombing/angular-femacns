import {ReportService} from '../../../report/_service/report.service';
import {LookupService} from '../../../lookup/_service/lookup.service';
import {AreaSearchTerm} from '../_model/mapping-area.model';
import {MappingAreaService} from '../_service/mapping-area.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ClrDatagridStateInterface} from '@clr/angular';
import {combineLatest, Subject} from 'rxjs';
import {SearchUtil} from '../../../_util/search.util';
import {AreaSearchItem} from '../_model/mapping-area.model';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {ReportType} from '../../../report/_const/report-type.const';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-mapping-area-search',
    templateUrl: './mapping-area-search.component.html',
    styleUrls: ['./mapping-area-search.component.scss']
})
export class MappingAreaSearchComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    mappingAreaForm: FormGroup;

    areaSearchList: PaginatedResponse<AreaSearchItem>;
    lookup: {
        minChar: number;
    };
    suggestion: {
        branches: string[];
    };
    qParams: SearchPagination<AreaSearchTerm>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        openWarningModal: boolean;
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
    };

    get cellNameDatalist(): string {
        return this.mappingAreaForm.get('cellName').value.length >= this.lookup.minChar ? 'cellSuggestion' : '';
    }

    get downloadIsDisabled(): boolean {
        return this.areaSearchList && this.areaSearchList.dataList
            ? this.areaSearchList.dataList.length === 0 : true;
    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<AreaSearchTerm>;

        if (this.qParams && this.areaSearchList.hasOwnProperty('dataList')) {

            term = {
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1,
                data: this.mappingAreaForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : []
            };

        } else if (this.qParams && !this.areaSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/culture/mapping-area/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private ar: ActivatedRoute,
        private mappingAreaSvc: MappingAreaService,
        private lookupService: LookupService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService
    ) {

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.mappingAreaForm = formBuilder.group({
            areaName: '',
            cellName: ''
        });

        this.areaSearchList = {} as PaginatedResponse<AreaSearchItem>;

        this.suggestion = {
            branches: []
        };

        this.lookup = {
            minChar: 2,
        };

        this.uiState = {
            isSearching: false,
            openWarningModal: false,
            reportIsDownloading: false,
            searchIsPressed: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.areaSearchList = {} as PaginatedResponse<AreaSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.mappingAreaForm.patchValue(this.qParams.data);

                    return this.mappingAreaSvc.postAreaList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                areaSearchList => this.areaSearchList = areaSearchList,
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

        this.clrPage.pipe(
            debounceTime(300),
            distinctUntilChanged((prevState, currentState) => JSON.stringify(prevState) === JSON.stringify(currentState)),
        ).subscribe(state => this.searchByPagination(state));

    }

    initialSetup(): void {

        combineLatest(
            this.lookupService.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.mappingAreaSvc.getAllBranch()
        )
            .subscribe(
                ([minChar, branches]) => {

                    this.lookup.minChar = minChar;
                    this.suggestion.branches = branches.map(branch => branch.branchName);

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

        this.searchUtil.noSearchParams(this.mappingAreaForm.getRawValue())
            ? this.uiState.openWarningModal = true
            : this.searchByInput();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.CULTURE_MAPPING_AREA, this.qParams.data)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-CULTURE-AREA-SEARCH-(${new Date().getTime()}).xlsx`;
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

    searchByInput(): void {

        this.uiState.openWarningModal = false;

        let term: SearchPagination<AreaSearchTerm> = {
            data: this.mappingAreaForm.getRawValue(),
            descending: false,
            orderBy: [],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.mappingAreaForm.getRawValue())) {

                term = {
                    data: this.mappingAreaForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.router.navigate(['/culture/mapping-area/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
