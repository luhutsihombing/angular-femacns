import {ReportService} from '../../report/_service/report.service';
import {SearchUtil} from '../../_util/search.util';
import {AuthInterceptor} from '../../auth/_interceptor/auth.interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {LookupService} from '../../lookup/_service/lookup.service';
import {MappingCellHoCreateComponent} from './mapping-cell-ho-create/mapping-cell-ho-create.component';
import {MappingCellHoEditComponent} from './mapping-cell-ho-edit/mapping-cell-ho-edit.component';
import {MappingCellHoSearchComponent} from './mapping-cell-ho-search/mapping-cell-ho-search.component';
import {MappingCellHoViewComponent} from './mapping-cell-ho-view/mapping-cell-ho-view.component';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {UserService} from '../../user/_service/user.service';
import {MappingHOValidator} from './_validator/mapping-ho.validator';
import {MappingHOService} from './_service/mapping-ho.service';


const routes: Routes = [
    {path: 'create', component: MappingCellHoCreateComponent},
    {path: 'search', component: MappingCellHoSearchComponent},
    {path: 'edit/:id', component: MappingCellHoEditComponent},
    {path: ':id', component: MappingCellHoViewComponent}
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [
        MappingCellHoSearchComponent,
        MappingCellHoCreateComponent,
        MappingCellHoEditComponent,
        MappingCellHoViewComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        LookupService,
        MappingHOService,
        MappingHOValidator,
        ReportService,
        SearchUtil,
        UserService,
    ]
})
export class MappingCellHoModule {
}
