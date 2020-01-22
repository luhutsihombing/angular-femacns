import { ReportService } from './../report/_service/report.service';
import { SearchUtil } from '../_util/search.util';
import { AuthInterceptor } from '../auth/_interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LookupCreateComponent } from './lookup-create/lookup-create.component';
import { LookupEditComponent } from './lookup-edit/lookup-edit.component';
import { LookupSearchComponent } from './lookup-search/lookup-search.component';
import { LookupService } from './_service/lookup.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: 'create', component: LookupCreateComponent },
  { path: 'search', component: LookupSearchComponent },
  { path: 'edit/:name', component: LookupEditComponent }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [LookupSearchComponent, LookupCreateComponent, LookupEditComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    SearchUtil,
    LookupService,
    ReportService
  ]
})
export class LookupModule {}
