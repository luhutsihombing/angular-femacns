import * as $ from 'jquery';
import {ActivatedRoute, Router} from '@angular/router';
import {CommentService} from '../_service/comment.service';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DATE_FORMATS} from '@angular/material';
import {MODULE_TYPES} from '../_const/comment.const';
import {ClrDatagridStateInterface} from '@clr/angular';
import {CommentSearchItem, CommentSearchTerm} from '../_model/comment.model';
import {Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap} from 'rxjs/operators';
import {ActionResponse, ErrorResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';

@Component({
    selector: 'fema-cms-comment-search',
    templateUrl: './comment-search.component.html',
    styleUrls: ['./comment-search.component.scss'],
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
export class CommentSearchComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    commentForm: FormGroup;
    moduleTypes: Array<{ name: string; value: string }>;

    commentSearchList: PaginatedResponse<CommentSearchItem>;
    qParams: SearchPagination<CommentSearchTerm>;

    responseOnAction: ActionResponse;

    uiState: {
        isSearching: boolean;
        periodeToIsOpen: boolean;
        periodFromIsOpen: boolean;
        searchIsPressed: boolean;
    };

    constructor(
        private ar: ActivatedRoute,
        fb: FormBuilder,
        private router: Router,
        private commentSvc: CommentService,
    ) {

        this.moduleTypes = MODULE_TYPES;

        this.commentForm = fb.group({
            module: this.moduleTypes[0].value,
            periodFrom: ['', Validators.required],
            periodTo: ['', Validators.required],
            title: ''
        });

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.commentSearchList = {} as PaginatedResponse<CommentSearchItem>;

        this.uiState = {
            isSearching: false,
            periodeToIsOpen: false,
            periodFromIsOpen: false,
            searchIsPressed: false,
        };

    }

    ngOnInit() {

        this.commentForm.get('periodFrom').valueChanges.subscribe(
            periodFrom => typeof periodFrom === 'string'
                ? periodFrom
                : this.commentForm.get('periodFrom').patchValue(periodFrom.format('YYYY-MM-DD'))
        );

        this.commentForm.get('periodTo').valueChanges.subscribe(
            periodTo => typeof periodTo === 'string'
                ? periodTo
                : this.commentForm.get('periodTo').patchValue(periodTo.format('YYYY-MM-DD'))
        );

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.commentSearchList = {} as PaginatedResponse<CommentSearchItem>;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false,
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.commentForm.patchValue(this.qParams.data);

                    let httpSearch: Observable<PaginatedResponse<CommentSearchItem>> = of({} as PaginatedResponse<CommentSearchItem>);

                    switch (this.qParams.data.module) {

                        case 'NEWSINFO':
                            httpSearch = this.commentSvc.postCommentSearchNews(this.qParams);
                            break;

                        case 'FIFTUBE':
                            httpSearch = this.commentSvc.postCommentSearchVideo(this.qParams);
                            break;

                    }

                    return httpSearch.pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                commentSearchList => this.commentSearchList = commentSearchList,
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

        this.uiState.searchIsPressed = true;

        this.invalidField(this.commentForm)
            ? $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing')
            : this.searchByInput();

    }

    resetCalendar(selector: string): void {

        this.commentForm.get(selector).patchValue('');

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.commentForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.searchIsPressed : false;

        }

        return ctrl.invalid && this.uiState.searchIsPressed;

    }

    searchByInput(): void {

        let term: SearchPagination<CommentSearchTerm> = {
            data: this.commentForm.getRawValue(),
            descending: false,
            orderBy: ['title'],
            currentPage: 1
        };

        if (this.qParams && this.qParams.data) {

            if (JSON.stringify(this.qParams.data) === JSON.stringify(this.commentForm.getRawValue())) {

                term = {
                    data: this.commentForm.getRawValue(),
                    descending: this.qParams.descending,
                    orderBy: this.qParams.orderBy,
                    currentPage: this.qParams.currentPage
                };

            }

        }

        this.router.navigate(['/comment/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    private searchByPagination(state: ClrDatagridStateInterface): void {

        let term: SearchPagination<CommentSearchTerm>;

        if (this.qParams && this.commentSearchList.hasOwnProperty('dataList')) {

            term = {
                data: this.commentForm.getRawValue(),
                descending: state && state.sort ? state.sort.reverse : false,
                orderBy: state && state.sort && typeof state.sort.by === 'string' ? [state.sort.by] : ['title'],
                currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
            };

        } else if (this.qParams && !this.commentSearchList.hasOwnProperty('dataList')) {

            term = this.qParams;

        }

        this.router.navigate(['/comment/search'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
