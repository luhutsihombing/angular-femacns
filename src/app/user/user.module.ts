import { ReportService } from './../report/_service/report.service';
import { SearchUtil } from '../_util/search.util';
import { LookupService } from '../lookup/_service/lookup.service';
import { AuthInterceptor } from '../auth/_interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ResponsibilityService } from '../responsibility/_service/responsibility.service';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { UserService } from './_service/user.service';
import { UserViewComponent } from './user-view/user-view.component';

const routes: Routes = [
  { path: 'search', component: UserSearchComponent },
  { path: 'create', component: UserCreateComponent },
  { path: 'edit/:username', component: UserEditComponent },
  { path: ':username', component: UserViewComponent }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [UserSearchComponent, UserViewComponent, UserCreateComponent, UserEditComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    SearchUtil,
    LookupService,
    ResponsibilityService,
    UserService,
    ReportService
  ]
})
export class UserModule {}
