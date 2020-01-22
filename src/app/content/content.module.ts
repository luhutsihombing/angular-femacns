import {ContentSearchService} from './content-search/content-search.service';
import {SearchUtil} from '../_util/search.util';
import {ApiResourceService} from '../_service/api-resource.service';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {ContentSearchComponent} from './content-search/content-search.component';
import {ContentService} from './_service/content.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LookupService} from '../lookup/_service/lookup.service';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {DatePipe} from '@angular/common';
import {FemaValidator} from '../_validators/fema.validators';
import {ReportService} from '../report/_service/report.service';
import {EventService} from '../event/_service/event.service';
import {FeedbackService} from '../feedback/_service/feedback.service';
import {HcmsService} from '../_service/hcms.service';
import {VideoService} from '../video/_service/video.service';
import {ContentEditComponent} from './content-edit/content-edit.component';
import {QuillModule} from '../_quill/_quill.module';

const routes: Routes = [
    {path: 'create', loadChildren: './content-create/content-create.module#ContentCreateModule'},
    {path: 'search', component: ContentSearchComponent},
    {path: 'edit/:id', component: ContentEditComponent},
    {path: ':id', loadChildren: './content-view/content-view.module#ContentViewModule'}
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        QuillModule,
    ],
    declarations: [ContentEditComponent, ContentSearchComponent],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        ApiResourceService,
        ContentService,
        ContentSearchService,
        DatePipe,
        EventService,
        FeedbackService,
        FemaValidator,
        HcmsService,
        LookupService,
        ReportService,
        SearchUtil,
        VideoService,
    ]
})
export class ContentModule {
}
