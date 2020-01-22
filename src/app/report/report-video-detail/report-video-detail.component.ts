import {VideoService} from '../../video/_service/video.service';
import {API_RESOURCE_REPORT_LOGO} from '../../_const/api.const';
import {SearchUtil} from '../../_util/search.util';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {ReportData, ReportNewsDetailSearchTerm, ReportVideoDetailSearchTerm} from '../_model/report.model';
import {ReportService} from '../_service/report.service';
import {ReportType} from '../_const/report-type.const';
import {filter, switchMap, tap, debounceTime, distinctUntilChanged, finalize} from 'rxjs/operators';
import {MAT_DATE_FORMATS} from '@angular/material';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {combineLatest} from 'rxjs';
import {VideoSuggestion} from '../../video/_model/video.model';
import {EventService} from '../../event/_service/event.service';
import {Employee} from '../../event/_model/event.model';
import * as $ from 'jquery';

@Component({
    selector: 'fema-cms-report-video-detail',
    templateUrl: './report-video-detail.component.html',
    styleUrls: ['./report-video-detail.component.scss'],
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
export class ReportVideoDetailComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDate: Date;
    reportForm: FormGroup;
    srcImage: string;

    lookup: {
        minChar: number;
        pageSize: number;
    };
    reportData: ReportData;
    suggestion: {
        employees: Employee[];
        videos: VideoSuggestion[];
    };
    qParams: ReportVideoDetailSearchTerm;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        endDateIsOpen: boolean;
        isSearching: boolean;
        reportIsDownloading: boolean;
        searchIsPressed: boolean;
        searchModalIsOpen: boolean;
        startDateIsOpen: boolean;
    };

    get titleDatalist(): string {
        return this.reportForm.get('title').value.length >= this.lookup.minChar ? 'videoSuggestions' : '';
    }

    get downloadIsDisabled(): boolean {
        return this.reportData && this.reportData.entries ? this.reportData.entries.length === 0 : true;
    }

    get empNameDatalist(): string {
        return this.reportForm.get('empName').value.length >= this.lookup.minChar ? 'employeeSuggestions' : '';
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
        private eventSvc: EventService
    ) {

        this.srcImage = `${API_RESOURCE_REPORT_LOGO}/fifgroup_logo.png`;

        this.reportForm = fb.group({
            empName: '',
            endDate: '',
            startDate: '',
            title: '',
        });

        this.currentDate = new Date();
        this.reportData = {} as ReportData;

        this.lookup = {
            minChar: 2,
            pageSize: 10
        };

        this.suggestion = {
            employees: [],
            videos: []
        };

        this.uiState = {
            endDateIsOpen: false,
            isSearching: false,
            reportIsDownloading: false,
            searchIsPressed: false,
            searchModalIsOpen: false,
            startDateIsOpen: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.hasOwnProperty('q')),
                tap(() => {

                    this.reportData = {} as ReportData;

                    this.uiState = {
                        ...this.uiState,
                        isSearching: true,
                        searchIsPressed: false
                    };

                }),
                switchMap(({q}) => {

                    this.qParams = JSON.parse(q);

                    if (this.searchUtil.noSearchParams(this.qParams)) {

                        this.reportForm.patchValue({} as ReportNewsDetailSearchTerm);

                    } else {

                        this.reportForm.patchValue(this.qParams);

                    }

                    return this.reportSvc.getSearchResults(ReportType.VIDEO_DETAIL, this.reportForm.getRawValue())
                        .pipe(finalize(() => this.uiState.isSearching = false));

                }),
            )
            .subscribe(
                reportData => this.reportData = reportData,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

        this.reportForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                filter(title => title && title.length >= this.lookup.minChar),
                distinctUntilChanged(),
                switchMap(title => this.videoSvc.getVideoSuggestion(title))
            )
            .subscribe(videos => this.suggestion.videos = videos);

        this.reportForm.get('empName').valueChanges
            .pipe(
                debounceTime(300),
                filter(empName => empName && empName.length >= this.lookup.minChar),
                distinctUntilChanged(),
                switchMap(empName => this.eventSvc.getNpk(empName))
            )
            .subscribe(employees => this.suggestion.employees = employees);

    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS')
        )
            .subscribe(
                ([minChar, pageSize]) => this.lookup = {minChar, pageSize},
                error => this.errorOnInit = {...error, type: 'ErrorResponse'}
            );

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

        let startDate = this.reportForm.get('startDate').value;
        startDate = typeof startDate === 'object' ? startDate.format('YYYY-MM-DD') : startDate;

        let endDate = this.reportForm.get('endDate').value;
        endDate = typeof endDate === 'object' ? endDate.format('YYYY-MM-DD') : endDate;

        const term: ReportVideoDetailComponent = {...this.reportForm.getRawValue(), startDate, endDate};

        this.router.navigate(['/report/video-detail'], {
            queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
            queryParamsHandling: 'merge'
        }).then();

    }

    downloadReport(evt: Event): void {

        evt.preventDefault();

        this.uiState.reportIsDownloading = true;

        this.reportSvc.getDownloadUrl(ReportType.VIDEO_DETAIL, this.reportForm.getRawValue())
            .pipe(finalize(() => this.uiState.reportIsDownloading = false))
            .subscribe(
                reportUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-REPORT-VIDEO-DETAIL-(${new Date().getTime()}).xls`;
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

}
