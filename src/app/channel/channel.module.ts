import { ReportService } from './../report/_service/report.service';
import {ApiResourceService} from '../_service/api-resource.service';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {ChannelCreateComponent} from './channel-create/channel-create.component';
import {ChannelEditComponent} from './channel-edit/channel-edit.component';
import {ChannelSearchComponent} from './channel-search/channel-search.component';
import {ChannelService} from './_service/channel.service';
import {ChannelViewComponent} from './channel-view/channel-view.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LookupService} from '../lookup/_service/lookup.service';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {VideoService} from '../video/_service/video.service';
import {SearchUtil} from '../_util/search.util';
import {HcmsService} from '../_service/hcms.service';
import {FemaValidator} from '../_validators/fema.validators';

const routes: Routes = [
    {path: 'search', component: ChannelSearchComponent},
    {path: 'create', component: ChannelCreateComponent},
    {path: 'edit/:id', component: ChannelEditComponent},
    {path: ':id', component: ChannelViewComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [ChannelCreateComponent, ChannelSearchComponent, ChannelEditComponent, ChannelViewComponent],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        LookupService,
        ApiResourceService,
        VideoService,
        ChannelService,
        FemaValidator,
        HcmsService,
        SearchUtil,
        ReportService,
    ]
})
export class ChannelModule {
}
