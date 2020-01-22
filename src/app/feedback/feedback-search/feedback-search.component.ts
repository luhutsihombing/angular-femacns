import {ReportService} from '../../report/_service/report.service';
import {FormGroup, FormBuilder} from '@angular/forms';
import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {FeedbackSearchItem, FeedbackSearchTerm} from '../_model/feedback.model';
import {SearchUtil} from '../../_util/search.util';
import {ActivatedRoute, Router} from '@angular/router';
import {filter, finalize, switchMap, tap} from 'rxjs/operators';
import {FeedbackService} from '../_service/feedback.service';
import {ActionResponse, ErrorResponse, FemaOption} from '../../_model/app.model';
import {STANDARD_LOOKUP_SELECTION} from '../../_const/standard.const';
import {ReportType} from '../../report/_const/report-type.const';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-feedback-search',
    templateUrl: './feedback-search.component.html',
    styleUrls: ['./feedback-search.component.scss']
})
export class FeedbackSearchComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    feedbackForm: FormGroup;
    formOptions: {
        templateCategories: Array<FemaOption>;
    };

    feedbackSearchList: FeedbackSearchItem[];
    qParams: FeedbackSearchTerm;

    responseOnAction: ActionResponse;
    errorOnAction: ErrorResponse;

    uiState: {
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchModalIsOpen: boolean;
        searchIsPressed: boolean;
        templateIsDownloading: boolean;
    };

    get downloadIsDisabled(): boolean {
        return this.feedbackSearchList.length === 0;
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private feedbackSvc: FeedbackService,
        private reportSvc: ReportService,
        private searchUtil: SearchUtil,
    ) {

        this.feedbackForm = fb.group({
            templateName: '',
            templateCategory: ''
        });

        this.formOptions = {
            templateCategories: STANDARD_LOOKUP_SELECTION
                .map(({meaning, id}) => ({meaning, detailCode: id}))
                .concat([
                    {meaning: 'Training', detailCode: 'TRAINING'},
                    {meaning: 'Non-training', detailCode: 'NON_TRAINING'}
                ])
        };

        this.feedbackSearchList = [];

        this.uiState = {
            isSearching: false,
            reportIsDownloading: false,
            searchModalIsOpen: false,
            searchIsPressed: false,
            templateIsDownloading: false,
        };

    }

    ngOnInit() {

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.feedbackSearchList = [];

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false
                    };

                    sessionStorage.setItem('cmsfeedbackSearchUrl', this.router.url);

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    this.feedbackForm.patchValue(this.qParams);

                    return this.feedbackSvc.search(this.feedbackForm.getRawValue())
                        .pipe(finalize(() => this.uiState.isSearching = false));

                })
            )
            .subscribe(
                feedbackSearchList => this.feedbackSearchList = feedbackSearchList,
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.FEEDBACK_SEARCH, this.qParams)
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-FEEDBACK-SEARCH-(${new Date().getTime()}).xlsx`;
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

    downloadTemplateUsage(evt: Event, {id, templateName}): void {

        evt.preventDefault();

        this.uiState.templateIsDownloading = true;

        this.reportSvc
            .getDownloadUrl(ReportType.TEMPLATE_USAGE, {feedbackId: id})
            .pipe(finalize(() => this.uiState.templateIsDownloading = false))
            .subscribe(
                dlUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.download = `FEMA-FEEDBACK-TEMPLATE-USAGE-(${templateName}).xls`;
                    aEle.href = dlUrl;

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

        this.searchUtil.noSearchParams(this.feedbackForm.getRawValue())
            ? this.uiState.searchModalIsOpen = true
            : this.searchByInput();

    }


    searchByInput(): void {

        this.uiState.searchModalIsOpen = false;

        this.router.navigate(['/feedback/search'], {
            queryParams: {q: JSON.stringify(this.feedbackForm.getRawValue()), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

}
