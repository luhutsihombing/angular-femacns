import {ReportService} from '../report/_service/report.service';
import {FeedbackViewComponent} from './feedback-view/feedback-view.component';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {FeedbackCreateComponent} from './feedback-create/feedback-create.component';
import {FeedbackSearchComponent} from './feedback-search/feedback-search.component';
import {FeedbackService} from './_service/feedback.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LookupService} from '../lookup/_service/lookup.service';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchUtil} from '../_util/search.util';
import {SharedModule} from '../shared/shared.module';
import {FeedbackEditComponent} from './feedback-edit/feedback-edit.component';
import {FeedbackChangeSequenceComponent} from './feedback-change-sequence/feedback-change-sequence.component';
import {ApiResourceService} from '../_service/api-resource.service';
import {FemaValidator} from '../_validators/fema.validators';
import {FeedbackModalDeleteQuestionComponent} from './feedback-modal-delete-question/feedback-modal-delete-question.component';
import {FeedbackModalDeleteCategoryComponent} from './feedback-modal-delete-category/feedback-modal-delete-category.component';
import {FeedbackValidator} from './_validator/feedback.validator';
import {FemaService} from '../_service/fema.service';

const routes: Routes = [
    {path: 'search', component: FeedbackSearchComponent},
    {path: 'create', component: FeedbackCreateComponent},
    {path: 'edit/:id', component: FeedbackEditComponent},
    {path: 'sequence/:id', component: FeedbackChangeSequenceComponent},
    {path: ':id', component: FeedbackViewComponent},
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [
        FeedbackChangeSequenceComponent,
        FeedbackCreateComponent,
        FeedbackEditComponent,
        FeedbackModalDeleteCategoryComponent,
        FeedbackModalDeleteQuestionComponent,
        FeedbackSearchComponent,
        FeedbackViewComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        SearchUtil,
        ApiResourceService,
        FeedbackService,
        FemaService,
        FeedbackValidator,
        FemaValidator,
        LookupService,
        ReportService
    ]
})
export class FeedbackModule {
}
