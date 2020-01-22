import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';


import {SearchUtil} from '../_util/search.util';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';

import {HTTP_INTERCEPTORS} from '@angular/common/http';

import {LookupService} from '../lookup/_service/lookup.service';
import {FeedbackService} from '../feedback/_service/feedback.service';
import {HcmsService} from '../_service/hcms.service';
import {FemaValidator} from '../_validators/fema.validators';
import { ReportService } from '../report/_service/report.service';

import { ApiResourceService } from '../_service/api-resource.service';
import { DatePipe } from '@angular/common';
import { ApprovalSearchComponent } from './workflow-search/setup-approval-search.component';
import { ApprovalCreateComponent } from './setup-approval/setup-approval-create.component';
import { WorkflowService } from './service/workflow.service';
import { ApprovalViewComponent } from './setup-approval-view/setup-approval-view.component';
import { ApprovalEditComponent } from './setup-approval-edit/setup-approval-edit.component';


const routes: Routes = [
    
        {path: 'search', component: ApprovalSearchComponent},
        {path: 'create', component: ApprovalCreateComponent},
        {path: ':id', component: ApprovalViewComponent},
        {path: 'edit/:id', component: ApprovalEditComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [ApprovalCreateComponent,ApprovalSearchComponent, ApprovalViewComponent, ApprovalEditComponent
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
        LookupService,
        FemaValidator,
        WorkflowService,
        HcmsService,
        ReportService,
    ]
})

export class WorkflowModule {
}