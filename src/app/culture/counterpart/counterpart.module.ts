import {ResponsibilityService} from '../../responsibility/_service/responsibility.service';
import {LookupService} from '../../lookup/_service/lookup.service';
import {CounterpartService} from './_service/counterpart.service';
import {AuthInterceptor} from '../../auth/_interceptor/auth.interceptor';
import {CounterpartCreateComponent} from './counterpart-create/counterpart-create.component';
import {CounterpartSearchComponent} from './counterpart-search/counterpart-search.component';
import {CounterpartViewComponent} from './counterpart-view/counterpart-view.component';
import {CounterpartEditComponent} from './counterpart-edit/counterpart-edit.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {CounterpartModalViewAreaComponent} from './counterpart-modal-view-area/counterpart-modal-view-area.component';
import {SearchUtil} from '../../_util/search.util';
import {ReportService} from '../../report/_service/report.service';

const routes: Routes = [
    {path: 'create', component: CounterpartCreateComponent},
    {path: 'edit/:id', component: CounterpartEditComponent},
    {path: 'search', component: CounterpartSearchComponent},
    {path: ':id', component: CounterpartViewComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [
        CounterpartSearchComponent,
        CounterpartCreateComponent,
        CounterpartEditComponent,
        CounterpartViewComponent,
        CounterpartModalViewAreaComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        CounterpartService,
        LookupService,
        ResponsibilityService,
        SearchUtil,
        ReportService
    ]
})
export class CounterpartModule {
}
