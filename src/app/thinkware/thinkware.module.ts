import {SearchUtil} from '../_util/search.util';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {ThinkwareCreateComponent} from './thinkware-create/thinkware-create.component';
import {ThinkwareSearchComponent} from './thinkware-search/thinkware-search.component';
import {ThinkwareService} from './_service/thinkware.service';
import {ThinkwareViewComponent} from './thinkware-view/thinkware-view.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {LookupService} from '../lookup/_service/lookup.service';
import {FeedbackService} from '../feedback/_service/feedback.service';
import {HcmsService} from '../_service/hcms.service';
import {FemaValidator} from '../_validators/fema.validators';
import { ReportService } from '../report/_service/report.service';
import { ThinkwareCreateSsComponent } from './thinkware-create/thinkware-create-ss/thinkware-create-ss.component';
import { ThinkwareCreateQcpComponent } from './thinkware-create/thinkware-create-qcp/thinkware-create-qcp.component';
import { ThinkwareCreateQccComponent } from './thinkware-create/thinkware-create-qcc/thinkware-create-qcc.component';
import { ThinkwareCreateIiComponent } from './thinkware-create/thinkware-create-ii/thinkware-create-ii.component';
import { ThinkwareViewIiComponent } from './thinkware-view/thinkware-view-ii/thinkware-view-ii.component';
import { ThinkwareViewSsComponent } from './thinkware-view/thinkware-view-ss/thinkware-view-ss.component';
import { ThinkwareViewQcpComponent } from './thinkware-view/thinkware-view-qcp/thinkware-view-qcp.component';
import { ThinkwareViewQccComponent } from './thinkware-view/thinkware-view-qcc/thinkware-view-qcc.component';
import { ThinkwareEditIiComponent } from './thinkware-edit/thinkware-edit-ii/thinkware-edit-ii.component';
import { ThinkwareEditSsComponent } from './thinkware-edit/thinkware-edit-ss/thinkware-edit-ss.component';
import { ThinkwareEditQcpComponent } from './thinkware-edit/thinkware-edit-qcp/thinkware-edit-qcp.component';
import { ThinkwareEditQccComponent } from './thinkware-edit/thinkware-edit-qcc/thinkware-edit-qcc.component';
import { ThinkwareEditComponent } from './thinkware-edit/thinkware-edit.component';
import { ApiResourceService } from '../_service/api-resource.service';
import { DatePipe } from '@angular/common';
import { ThinkwareAttachmentComponent } from './thinkware-attachment/thinkware-attachment.component';


const routes: Routes = [
    {path: 'create', component: ThinkwareCreateComponent},
    {path: 'search', component: ThinkwareSearchComponent},
    {path: ':id', component: ThinkwareViewComponent},
    {path: 'edit/:id', component: ThinkwareEditComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [ThinkwareSearchComponent,
        ThinkwareViewComponent,
        ThinkwareCreateComponent,
        ThinkwareCreateSsComponent,
        ThinkwareCreateQcpComponent,
        ThinkwareCreateQccComponent,
        ThinkwareCreateIiComponent,
        ThinkwareEditSsComponent,
        ThinkwareEditQcpComponent,
        ThinkwareEditQccComponent,
        ThinkwareEditIiComponent,
        ThinkwareViewIiComponent,
        ThinkwareViewSsComponent,
        ThinkwareViewQcpComponent,
        ThinkwareViewQccComponent,
        ThinkwareEditComponent,
        ThinkwareAttachmentComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        ApiResourceService,
        SearchUtil,
        DatePipe,
        FeedbackService,
        ThinkwareService,
        LookupService,
        FemaValidator,
        HcmsService,
        ReportService,
    ]
})
export class ThinkwareModule {
}
