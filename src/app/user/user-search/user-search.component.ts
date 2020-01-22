import {ReportService} from '../../report/_service/report.service';
import {SearchUtil} from '../../_util/search.util';
import {Subject, combineLatest} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {LookupService} from '../../lookup/_service/lookup.service';
import {UserService} from '../_service/user.service';
import {Component, OnInit, ChangeDetectorRef, AfterViewChecked, ElementRef, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {ResponsibilityService} from '../../responsibility/_service/responsibility.service';
import {UserSearchItem, UserSearchTerm} from '../_model/user.model';
import {Validators} from '@angular/forms';
import {ClrDatagridStateInterface} from '@clr/angular';
import {debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, tap} from 'rxjs/operators';
import {ReportType} from '../../report/_const/report-type.const';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-user-search',
    templateUrl: './user-search.component.html',
    styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit, AfterViewChecked {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    userForm: FormGroup;

    lookup: {
        minChar: number;
    };
    qParams: SearchPagination<UserSearchTerm>;
    suggestion: {
        fullNames: string[];
        resps: string[];
        userNames: string[];
    };
    userSearchList: PaginatedResponse<UserSearchItem>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.userSearchList && this.userSearchList.dataList
            ? this.userSearchList.dataList.length === 0 : true;
    }

    get responsibilityDatalist(): string {
        return this.userForm.get('responsibility').value.length >= this.lookup.minChar ? 'responsibilitySelection' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private respSvc: ResponsibilityService,
        private userService: UserService,
        private searchUtil: SearchUtil,
        private reportSvc: ReportService,
    ) {

        this.userForm = formBuilder.group({
            username: ['', Validators.maxLength(50)],
            fullName: ['', Validators.maxLength(250)],
            responsibility: ['', Validators.maxLength(100)]
        });

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.lookup = {
            minChar: 2,
        };

        this.userSearchList = {} as PaginatedResponse<UserSearchItem>;

        this.suggestion = {
            fullNames: [],
            resps: [],
            userNames: []
        };

        this.uiState = {
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.userForm.get('username').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(username => username && username.length >= this.lookup.minChar),
                switchMap(username => this.userService.searchUserList({
                    data: {...{} as UserSearchTerm, username},
                    currentPage: 1,
                    descending: false,
                    orderBy: ['username']
                })),
                map(userNames => userNames.dataList.map(usr => usr.username)),
            )
            .subscribe(userNames => this.suggestion.userNames = userNames);

        this.userForm.get('fullName').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(fullName => fullName && fullName.length >= this.lookup.minChar),
                switchMap(fullName => this.userService.searchUserList({
                    data: {...{} as UserSearchTerm, fullName},
                    currentPage: 1,
                    descending: false,
                    orderBy: ['fullName']
                })),
                map(fullNames => fullNames.dataList.map(usr => usr.fullName)),
            )
            .subscribe(fullNames => this.suggestion.fullNames = fullNames);

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.userSearchList = {} as PaginatedResponse<UserSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        searchIsPressed: false,
                        isSearching: true,
                    };

                }),
                switchMap(qParams => {

                    this.qParams = JSON.parse(qParams.q);

                    this.userForm.patchValue(this.qParams);

                    return this.userService.searchUserList(this.qParams)
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                userSearchList => this.userSearchList = userSearchList,
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

        this.searchUtil.noSearchParams(this.userForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.respSvc.postResponsibilitySearchList()
        )
            .subscribe
            (([minChar, resps]) => {
                    this.lookup.minChar = minChar;
                    this.suggestion.resps = resps.dataList.map(resp => resp.name);
                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.userForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    searchByInput(): void {

        this.responseOnAction = null;

        let term: SearchPagination<UserSearchTerm> = {
            data: {
                ...this.userForm.getRawValue(),
                username: this.userForm.get('username').value.split('.').join(''),
                fullName: this.userForm.get('fullName').value.split('.').join(''),
            },
            descending: false,
            orderBy: [],
            currentPage: 1,
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.userForm.getRawValue())) {

                term = {
                    data: {
                        ...this.userForm.getRawValue(),
                        username: this.userForm.get('username').value.split('.').join(''),
                        fullName: this.userForm.get('fullName').value.split('.').join(''),
                    },
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage,
                };

            }

        }

        this.uiState.searchModalIsOpen = false;

        this.router.navigate(['/user/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<UserSearchTerm>;

        if (this.qParams && this.userSearchList.hasOwnProperty('dataList')) {

            term = {
                data: {
                    ...this.userForm.getRawValue(),
                    username: this.userForm.get('username').value.split('.').join(''),
                    fullName: this.userForm.get('fullName').value.split('.').join(''),
                },
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : [],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.userSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/user/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = false;

        this.reportSvc.getDownloadUrl(ReportType.USER_SEARCH, this.userForm.getRawValue())
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-USER-SEARCH-(${new Date().getTime()}).xlsx`;
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

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.userForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

}
