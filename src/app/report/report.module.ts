import { ApiResourceService } from './../_service/api-resource.service';
import { ContentService } from './../content/_service/content.service';
import {ContentSearchService} from '../content/content-search/content-search.service';
import {EventService} from '../event/_service/event.service';
import {ReportFeedbackComponent} from './report-feedback/report-feedback.component';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {LookupService} from '../lookup/_service/lookup.service';
import {RouterModule, Routes} from '@angular/router';
import {ReportBeritaAcaraComponent} from './report-berita-acara/report-berita-acara.component';
import {ReportNewsDetailComponent} from './report-news-detail/report-news-detail.component';
import {ReportNewsSummaryComponent} from './report-news-summary/report-news-summary.component';
import {ReportService} from './_service/report.service';
import {ReportVideoDetailComponent} from './report-video-detail/report-video-detail.component';
import {ReportVideoSummaryComponent} from './report-video-summary/report-video-summary.component';
import {SearchUtil} from '../_util/search.util';
import {SharedModule} from '../shared/shared.module';
import {ReportNpkCouponComponent} from './report-npk-coupon/report-npk-coupon.component';
import {ReportBeritaAcaraService} from './report-berita-acara/report-berita-acara.service';
import {CounterpartService} from '../culture/counterpart/_service/counterpart.service';
import {VideoService } from '../video/_service/video.service';

const routes: Routes = [
    {path: 'berita-acara', component: ReportBeritaAcaraComponent},
    {path: 'news-detail', component: ReportNewsDetailComponent},
    {path: 'news-summary', component: ReportNewsSummaryComponent},
    {path: 'video-detail', component: ReportVideoDetailComponent},
    {path: 'video-summary', component: ReportVideoSummaryComponent},
    {path: 'npk-coupon', component: ReportNpkCouponComponent},
    {path: 'feedback', component: ReportFeedbackComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [
        ReportBeritaAcaraComponent,
        ReportNewsDetailComponent,
        ReportVideoDetailComponent,
        ReportVideoSummaryComponent,
        ReportNewsSummaryComponent,
        ReportNpkCouponComponent,
        ReportFeedbackComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        SearchUtil,
        CounterpartService,
        LookupService,
        ReportService,
        ReportBeritaAcaraService,
        EventService,
        ContentSearchService,
        VideoService,
        ContentService,
        ApiResourceService
    ]
})
export class ReportModule {
}
