import { ReportService } from './../../report/_service/report.service';
import { LookupService } from '../../lookup/_service/lookup.service';
import { SearchUtil } from '../../_util/search.util';
import { MappingAreaService } from './_service/mapping-area.service';
import { AuthInterceptor } from '../../auth/_interceptor/auth.interceptor';
import { MappingAreaCreateComponent } from './mapping-area-create/mapping-area-create.component';
import { MappingAreaSearchComponent } from './mapping-area-search/mapping-area-search.component';
import { MappingAreaViewComponent } from './mapping-area-view/mapping-area-view.component';
import { MappingAreaEditComponent } from './mapping-area-edit/mapping-area-edit.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: 'create', component: MappingAreaCreateComponent },
  { path: 'edit/:id', component: MappingAreaEditComponent },
  { path: 'search', component: MappingAreaSearchComponent },
  { path: ':id', component: MappingAreaViewComponent }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [
    MappingAreaSearchComponent,
    MappingAreaCreateComponent,
    MappingAreaEditComponent,
    MappingAreaViewComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    SearchUtil,
    MappingAreaService,
    LookupService,
    ReportService
  ]
})
export class MappingAreaModule {}
