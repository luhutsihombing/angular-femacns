import { SearchUtil } from '../_util/search.util';
import { AuthInterceptor } from '../auth/_interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AssignmentCreateComponent } from './assignment-create/assignment-create.component';
import { AssignmentSearchComponent } from './assignment-search/assignment-search.component';
import { AssignmentService } from './_service/assignment.service';

const routes: Routes = [
  { path: 'assignment/create', component: AssignmentCreateComponent },
  { path: 'assignment/search', component: AssignmentSearchComponent },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [
    AssignmentCreateComponent,
    AssignmentSearchComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    SearchUtil,
    AssignmentService
  ]
})
export class PeaModule {}
