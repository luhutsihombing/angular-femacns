import { SearchUtil } from '../_util/search.util';
import { AuthInterceptor } from '../auth/_interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
// import { ResponsibilityCreateComponent } from './responsibility-create/responsibility-create.component';
// import { ResponsibilityEditComponent } from './responsibility-edit/responsibility-edit.component';
import { CommentSearchComponent } from './comment-search/comment-search.component';
import { CommentService } from './_service/comment.service';
import { CommentViewComponent } from './comment-view/comment-view.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  { path: 'search', component: CommentSearchComponent },
  { path: ':type/:id', component: CommentViewComponent }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [CommentViewComponent, CommentSearchComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    CommentService,
    SearchUtil
  ]
})
export class CommentModule {}
