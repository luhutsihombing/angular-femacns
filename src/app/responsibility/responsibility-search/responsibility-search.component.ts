import {ActionResponse, ErrorResponse, PaginatedResponse} from '../../_model/app.model';
import {SearchUtil} from '../../_util/search.util';
import {STANDARD_LOOKUP_SELECTION} from '../../_const/standard.const';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupDetail} from '../../lookup/_model/lookup.model';
import {LookupService} from '../../lookup/_service/lookup.service';
import {ResponsibilitySearchItem, ResponsibilitySearchTerm} from '../_model/responsibility.model';
import {ResponsibilityService} from '../_service/responsibility.service';
import {filter, finalize, map, switchMap, tap} from 'rxjs/operators';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-responsibility-search',
    templateUrl: './responsibility-search.component.html',
    styleUrls: ['./responsibility-search.component.scss']
})
export class ResponsibilitySearchComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    respForm: FormGroup;

    qParams: ResponsibilitySearchTerm;
    peopleTypes: LookupDetail[];
    suggestions: {
        resps: string[];
    };

    respSearchList: PaginatedResponse<ResponsibilitySearchItem>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.respSearchList && this.respSearchList.dataList ? this.respSearchList.dataList.length === 0 : true;
    }

    constructor(
        private ar: ActivatedRoute,
        formBuilder: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private respSvc: ResponsibilityService,
        private searchUtil: SearchUtil,
    ) {

        this.respForm = formBuilder.group({
            name: ['', Validators.maxLength(100)],
            peopleType: ['']
        });

        this.suggestions = {
            resps: []
        };

        this.uiState = {
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.respSvc.postResponsibilitySearchList(this.respForm.value)
            .pipe(map(resps => resps.dataList.map(resp => resp.name)))
            .subscribe(resps => this.suggestions.resps = resps);

        this.lookupSvc.getPeopleTypes()
            .subscribe(
                peopleTypes => this.peopleTypes = STANDARD_LOOKUP_SELECTION.concat(peopleTypes.dataList),
                error => this.errorOnInit = {...error, type: 'ErrorResponse'}
            );

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.respSearchList = {} as PaginatedResponse<ResponsibilitySearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),

                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);

                    this.respForm.patchValue({
                        ...this.qParams,
                        peopleType: this.qParams.peopleType === null ? '' : this.qParams.peopleType
                    });

                    return this.respSvc.postResponsibilitySearchList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                respSearchList => this.respSearchList = respSearchList,
                error => {
                    this.responseOnAction = {...error, type: 'ActionResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.respForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.respForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        this.searchUtil.noSearchParams({
            ...this.respForm.getRawValue(),
            peopleType: this.respForm.getRawValue().peopleType === '' ? null : this.respForm.getRawValue().peopleType
        })
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: ResponsibilitySearchTerm;

        if (this.respForm.get('peopleType').value || this.respForm.get('name').value) {

            term = {
                ...({} as ResponsibilitySearchTerm),
                ...this.respForm.getRawValue(),
                peopleType: this.respForm.getRawValue().peopleType === '' ?
                    null : this.respForm.getRawValue().peopleType
            };

        } else if (!(this.respForm.get('peopleType').value && this.respForm.get('name').value)) {

            term = {
                ...({} as ResponsibilitySearchTerm),
                peopleType: null,
                name: null
            };

        }

        this.uiState.searchModalIsOpen = false;

        this.router.navigate(['/responsibility/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.respSvc.getDownloadUrl(this.respSearchList.dataList)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(reportUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.style = 'display: none';
                aEle.download = `FEMA-RESPONSIBILITY-SEARCH-(${new Date().getTime()}).xlsx`;
                aEle.href = reportUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }

}
