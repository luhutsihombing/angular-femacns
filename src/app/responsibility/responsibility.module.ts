import {SearchUtil} from '../_util/search.util';
import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LookupService} from '../lookup/_service/lookup.service';
import {NgModule} from '@angular/core';
import {ResponsibilityCreateComponent} from './responsibility-create/responsibility-create.component';
import {ResponsibilityEditComponent} from './responsibility-edit/responsibility-edit.component';
import {ResponsibilitySearchComponent} from './responsibility-search/responsibility-search.component';
import {ResponsibilityService} from './_service/responsibility.service';
import {ResponsibilityViewComponent} from './responsibility-view/responsibility-view.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {ResponsibilityValidator} from './_validator/responsibility.validators';

const routes: Routes = [
    {path: 'create', component: ResponsibilityCreateComponent},
    {path: 'edit/:id', component: ResponsibilityEditComponent},
    {path: 'search', component: ResponsibilitySearchComponent},
    {path: ':id', component: ResponsibilityViewComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [
        ResponsibilityCreateComponent,
        ResponsibilityEditComponent,
        ResponsibilityViewComponent,
        ResponsibilitySearchComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        SearchUtil,
        LookupService,
        ResponsibilityService,
        ResponsibilityValidator
    ]
})
export class ResponsibilityModule {
}
