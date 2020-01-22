import {SearchUtil} from '../_util/search.util';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {EventCreateComponent} from './event-create/event-create.component';
import {EventEditComponent} from './event-edit/event-edit.component';
import {EventSearchComponent} from './event-search/event-search.component';
import {EventService} from './_service/event.service';
import {EventViewComponent} from './event-view/event-view.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {LookupService} from '../lookup/_service/lookup.service';
import {FeedbackService} from '../feedback/_service/feedback.service';
import {HcmsService} from '../_service/hcms.service';
import {FemaValidator} from '../_validators/fema.validators';
import { ReportService } from './../report/_service/report.service';

const routes: Routes = [
    {path: 'create', component: EventCreateComponent},
    {path: 'edit/:id', component: EventEditComponent},
    {path: 'search', component: EventSearchComponent},
    {path: ':id', component: EventViewComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [EventCreateComponent, EventSearchComponent, EventEditComponent, EventViewComponent],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        SearchUtil,
        FeedbackService,
        EventService,
        LookupService,
        FemaValidator,
        HcmsService,
        ReportService,
    ]
})
export class EventModule {
}
