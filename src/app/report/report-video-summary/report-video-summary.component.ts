import { API_RESOURCE_REPORT_LOGO } from './../../_const/api.const';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit} from '@angular/core';
import {CONTENT_RECEIVERS} from '../../content/_const/content.const';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {ReportData, ReportVideoSummarySearchTerm} from '../_model/report.model';
import {ReportService} from '../_service/report.service';
import {SearchUtil} from '../../_util/search.util';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {ReportType} from '../_const/report-type.const';
import {concatMap, filter, switchMap, tap, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {merge, of, combineLatest} from 'rxjs';
import { VideoService } from '../../video/_service/video.service';
import { VideoSuggestion } from '../../video/_model/video.model';

@Component({
    selector: 'fema-cms-report-video-summary',
    templateUrl: './report-video-summary.component.html',
    styleUrls: ['./report-video-summary.component.scss']
})
export class ReportVideoSummaryComponent implements AfterViewChecked, OnInit {

    categories: Array<{ value: string; label: string }>;
    currentDate: Date;

    reportForm: FormGroup;

    reportData: ReportData;
    dlUrl: string;
    pageSize: number;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;
    srcImage: any;

    videoSuggestions: VideoSuggestion[];

    lookup: {
        minChar: number;
    };

    uiState: {
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
    };

    get titleDatalist(): string {
        return this.reportForm.get('title').value.length >= this.lookup.minChar ? 'videoSuggestions' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        fb: FormBuilder,
        private router: Router,
        private lookupSvc: LookupService,
        private reportSvc: ReportService,
        private searchUtil: SearchUtil,
        private videoSvc: VideoService,
    ) {
        this.srcImage = `${API_RESOURCE_REPORT_LOGO}/fifgroup_logo.png`;
        this.categories = STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS);

        this.currentDate = new Date();

        this.reportForm = fb.group({
            title: '',
            category: this.categories[0].value,
        });

        this.reportData = {} as ReportData;
        this.dlUrl = '';
        this.pageSize = 10;

        this.lookup = {
            minChar: 2,
        };

        this.uiState = {
            searchIsPressed: false,
            searchModalIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                concatMap(({q}) => {

                    let searchQuery: ReportVideoSummarySearchTerm = JSON.parse(q);

                    if (this.searchUtil.noSearchParams(searchQuery)) {

                        searchQuery = undefined;
                        this.reportForm.patchValue({} as ReportVideoSummarySearchTerm);

                    } else {

                        this.reportForm.patchValue(searchQuery);

                    }

                    return of(searchQuery);

                }),
                switchMap(searchQuery => merge(
                    this.reportSvc.getSearchResults(ReportType.VIDEO_SUMMARY, this.reportForm.getRawValue()),
                    this.reportSvc.getDownloadUrl(ReportType.VIDEO_SUMMARY, this.reportForm.getRawValue())
                )),
                tap(() => this.uiState.searchIsPressed = false),
            )
            .subscribe(
                response => {

                    if (typeof response === 'string') {
                        this.dlUrl = response;
                    } else {
                        this.reportData = response;
                    }

                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getLookupDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS')
        )
        .subscribe(
            response => [this.lookup.minChar, this.pageSize] = response,
            error => this.errorOnInit = {...error, type: 'ErrorResponse'}
        );

        this.reportForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(title => this.videoSvc.getVideoSuggestion(title))
            )
            .subscribe(videoSuggestions => this.videoSuggestions = videoSuggestions);

    }

    resetCalendar(formControlName: string): void {
        this.reportForm.get(formControlName).patchValue('');
    }

    checkSearchParams(evt: Event): void {

        evt.preventDefault();

        this.uiState.searchIsPressed = true;

        if (this.searchUtil.noSearchParams(this.reportForm.getRawValue())) {

            this.uiState.searchModalIsOpen = true;

        } else {

            this.searchByInput();

        }

    }

    searchByInput(): void {

        this.dlUrl = '';

        this.router.navigate(['/report/video-summary'], {
            queryParams: {q: JSON.stringify(this.reportForm.getRawValue()), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        const aEle: ElementRef['nativeElement'] = document.createElement('a');

        document.body.appendChild(aEle);

        aEle.style = 'display: none';
        aEle.download = `FEMA-REPORT-VIDEO-SUMMARY-(${new Date().getTime()}).xls`;
        aEle.href = this.dlUrl;

        aEle.click();

        URL.revokeObjectURL(aEle.href);

    }
}
