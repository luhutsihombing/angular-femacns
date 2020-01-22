import {ActivatedRoute, Router} from '@angular/router';
import {ClrDatagridStateInterface} from '@clr/angular';
import {combineLatest, from, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, finalize, map, switchMap, tap} from 'rxjs/operators';
import {DashboardService} from './_service/dashboard.service';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActionResponse, ErrorResponse, PaginatedResponse} from '../_model/app.model';
import {ContentBanner} from '../content/_model/content.model';
import * as $ from 'jquery';
import {Event as Evt} from '../event/_model/event.model';
import {LookupService} from '../lookup/_service/lookup.service';
import {DashboardBarChart, DashboardFeedbackEvent, DashboardNotification, DashboardYearlyUserAccess} from './_model/dashboard.model';
import {STANDARD_MONTHS_NUMBER_SELECTION} from '../_const/standard.const';
import * as JSZip from 'jszip';

interface DashboardCms {
    activeBanners: PaginatedResponse<ContentBanner>;
    activeEvents: PaginatedResponse<Evt>;
    feedbackEvents: PaginatedResponse<DashboardFeedbackEvent>;
    mostLikedNews: Array<{ count: number, title: string }>;
    mostViewedNews: Array<{ count: number, title: string }>;
    totalUserAccess: number;
    upcomingEvents: PaginatedResponse<Evt>;
    yearlyUserAccess: DashboardYearlyUserAccess[];
    yearlyUserAccessChart: DashboardBarChart;
    eventName: string;
}

interface HTMLSaveEvent extends Event {
    target: HTMLAnchorElement & EventTarget;
}

@Component({
    selector: 'fema-cms-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    barChartConfig: any;
    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    clrPage: Subject<ClrDatagridStateInterface>;
    qParams: { currentPage: number };

    feedback: {
        options: Array<{ label: string; value: string; }>;
        selection: string;
    };

    cms: DashboardCms;
    lookup: {
        pageSize: number
    };
    notificationList: PaginatedResponse<DashboardNotification>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        activeEventsIsLoading: boolean;
        chartIsDownloading: boolean;
        isRetrieving: boolean;
        feedbacksIsLoading: boolean;
        upcomingEventsIsLoading: boolean;
    };

    readonly ngForTracker: Function = (idx: number): number => idx;

    private searchByPagination(state: ClrDatagridStateInterface): void {

        const term: { currentPage: number } = {
            currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1
        };

        this.router.navigate(
            ['/dashboard'],
            {
                queryParams: {q: JSON.stringify(term), qTime: new Date().getTime()},
                queryParamsHandling: 'merge'
            }
        ).then();

    }

    constructor(
        private ar: ActivatedRoute,
        private router: Router,
        private dashboardSvc: DashboardService,
        private lookupSvc: LookupService,
    ) {

        this.clrPage = new Subject<ClrDatagridStateInterface>();

        this.barChartConfig = {
            legend: {position: 'right'},
            responsive: true,
            scales: {
                xAxes: [{stacked: true}],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                        userCallback: label => Math.floor(+label) === +label ? label : undefined,
                    }
                }]
            }
        };

        const localDate = new Date().toLocaleDateString('id-ID').split('/');
        const [currentMonth, currentYear] = localDate.slice(1, 3);

        this.feedback = {
            options: STANDARD_MONTHS_NUMBER_SELECTION.map(({label, value}) =>
                ({label, value: (value.length === 1 ? '0' + value : value) + currentYear})
            ),
            selection: (currentMonth.length === 1 ? '0' + currentMonth : currentMonth) + currentYear
        };

        this.cms = {} as DashboardCms;

        this.lookup = {
            pageSize: 20,
        };

        this.uiState = {
            activeEventsIsLoading: false,
            chartIsDownloading: false,
            feedbacksIsLoading: false,
            isRetrieving: false,
            upcomingEventsIsLoading: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                switchMap(qParams => {

                    this.qParams = qParams && qParams.q ? JSON.parse(qParams.q) : {currentPage: 1};

                    return this.dashboardSvc.getNotificationList(this.qParams);

                }),
            )
            .subscribe(
                notificationList => this.notificationList = notificationList,
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

    initialSetup(): void {

        this.uiState.isRetrieving = true;

        this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~RESULT_SIZE_CMS')
            .pipe(
                tap(pageSize => this.lookup.pageSize = pageSize),
                switchMap(pageSize =>
                    combineLatest(
                        this.dashboardSvc.activeBanners({currentPage: 1, pageSize}),
                        this.dashboardSvc.activeEvents({currentPage: 1, pageSize: 10}),
                        this.dashboardSvc.feedbackEvents({currentPage: 1, data: this.feedback.selection}),
                        this.dashboardSvc.mostLikedNews(),
                        this.dashboardSvc.mostViewedNews(),
                        this.dashboardSvc.totalUserAccess(),
                        this.dashboardSvc.upcomingEvents({currentPage: 1, pageSize}),
                        this.dashboardSvc.yearlyUserAccess(),
                    )
                ),
                finalize(() => this.uiState.isRetrieving = false)
            )
            .subscribe(
                (cms: any) => {

                    [
                        this.cms.activeBanners,
                        this.cms.activeEvents,
                        this.cms.feedbackEvents,
                        this.cms.mostLikedNews,
                        this.cms.mostViewedNews,
                        this.cms.totalUserAccess,
                        this.cms.upcomingEvents,
                        this.cms.yearlyUserAccess
                    ] = cms;

                    let userObject: DashboardYearlyUserAccess = {...this.cms.yearlyUserAccess[0]};

                    delete userObject.peopleTypeDesc;
                    delete userObject.peopleTypeLookupId;

                    const labels: string[] = Object.keys(userObject).map(label =>
                        label.toLowerCase().replace(/\b\w/g, match => match.toUpperCase())
                    );

                    labels.unshift('');

                    const datasets: DashboardBarChart['datasets'] = [];

                    for (const user of this.cms.yearlyUserAccess) {

                        userObject = {...user};

                        delete userObject.peopleTypeLookupId;

                        const {peopleTypeDesc, ...monthlyUsers} = userObject;

                        datasets.push({data: Object.values(monthlyUsers), label: peopleTypeDesc});

                    }

                    this.cms.yearlyUserAccessChart = {labels, datasets};

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    getActiveEvents(evt: Event): void {

        evt.preventDefault();

        this.uiState.activeEventsIsLoading = true;

        this.dashboardSvc.activeEvents({
            currentPage: +this.cms.activeEvents.currentPage + 1,
            pageSize: 10,
        })
            .pipe(finalize(() => this.uiState.activeEventsIsLoading = false))
            .subscribe(
                activeEvents => this.cms.activeEvents = {
                    ...activeEvents,
                    currentPage: activeEvents.dataList.length === 0 ? this.cms.activeEvents.currentPage : activeEvents.currentPage,
                    dataList: this.cms.activeEvents.dataList.concat(activeEvents.dataList)
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    getUpcomingEvents(evt: Event): void {

        evt.preventDefault();

        this.uiState.upcomingEventsIsLoading = true;

        this.dashboardSvc.upcomingEvents({
            currentPage: this.cms.activeEvents.currentPage + 1,
            pageSize: this.lookup.pageSize,
        })
            .pipe(finalize(() => this.uiState.upcomingEventsIsLoading = false))
            .subscribe(
                activeEvents => this.cms.activeEvents = {
                    ...activeEvents,
                    currentPage: activeEvents.dataList.length === 0 ? this.cms.activeEvents.currentPage : activeEvents.currentPage,
                    dataList: this.cms.activeEvents.dataList.concat(activeEvents.dataList)
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    getNewFeedbacks(selection: string): void {

        this.feedback.selection = selection;

        this.uiState.feedbacksIsLoading = true;

        this.dashboardSvc.feedbackEvents({
            currentPage: 1,
            data: this.feedback.selection,
        })
            .pipe(finalize(() => this.uiState.feedbacksIsLoading = false))
            .subscribe(
                feedbackEvents => this.cms.feedbackEvents = feedbackEvents,
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    extendFeedbacks(evt: Event): void {

        evt.preventDefault();

        this.uiState.feedbacksIsLoading = true;

        this.dashboardSvc.feedbackEvents({
            currentPage: this.cms.feedbackEvents.currentPage + 1,
            data: this.feedback.selection,
        })
            .pipe(finalize(() => this.uiState.feedbacksIsLoading = false))
            .subscribe(
                feedbackEvents => this.cms.feedbackEvents = {
                    ...feedbackEvents,
                    currentPage: feedbackEvents.dataList.length === 0
                        ? this.cms.feedbackEvents.currentPage : feedbackEvents.currentPage,
                    dataList: this.cms.feedbackEvents.dataList.concat(feedbackEvents.dataList)
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    saveChart(evt: HTMLSaveEvent): void {

        evt.preventDefault();

        this.uiState.chartIsDownloading = true;

        const fileDate: string = new Date().toISOString().split('T')[0];

        combineLatest(
            this.dashboardSvc.downloadUserAccess(this.cms.yearlyUserAccess),
            from(fetch(this.clrContentArea.nativeElement.querySelector('canvas').toDataURL()))
        )
            .pipe(
                map(([tableBlob, chartBlob]) => ({tableBlob, chartBlob: chartBlob.blob()})),
                switchMap(({tableBlob, chartBlob}) => {

                    const userZip = new JSZip();

                    userZip.file(`YEARLY-USER-ACCESS-(${fileDate}).xlsx`, tableBlob);
                    userZip.file(`YEARLY-USER-ACCESS-(${fileDate}).png`, chartBlob, {base64: true});

                    return from(userZip.generateAsync({type: 'blob'}));

                }),
                map(blob => URL.createObjectURL(blob)),
                finalize(() => this.uiState.chartIsDownloading = false),
            )
            .subscribe(blobUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.style = 'display: none';
                aEle.download = `YEARLY-USER-ACCESS-(${fileDate}).zip`;
                aEle.href = blobUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }

}
