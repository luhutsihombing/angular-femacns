import {ApiResourceService} from '../../_service/api-resource.service';
import {AuthInterceptor} from '../../auth/_interceptor/auth.interceptor';
import {ContentCreateBannerComponent} from './content-create-banner/content-create-banner.component';
import {ContentCreateComponent} from './content-create.component';
import {ContentCreateNewsComponent} from './content-create-news/content-create-news.component';
import {ContentCreatePopupComponent} from './content-create-popup/content-create-popup.component';
import {ContentService} from '../_service/content.service';
import {EventService} from '../../event/_service/event.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LookupService} from '../../lookup/_service/lookup.service';
import {NgModule} from '@angular/core';
import {QuillModule} from '../../_quill/_quill.module';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {VideoService} from '../../video/_service/video.service';
import {FeedbackService} from '../../feedback/_service/feedback.service';
import {HcmsService} from '../../_service/hcms.service';

const routes: Routes = [{path: '', component: ContentCreateComponent}];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        QuillModule,
    ],
    declarations: [
        ContentCreateComponent,
        ContentCreateNewsComponent,
        ContentCreatePopupComponent,
        ContentCreateBannerComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        ApiResourceService,
        ContentService,
        EventService,
        FeedbackService,
        HcmsService,
        LookupService,
        VideoService,
        FeedbackService
    ]
})
export class ContentCreateModule {
}
