import { ReportService } from './../report/_service/report.service';
import { SearchUtil } from '../_util/search.util';
import { LookupService } from '../lookup/_service/lookup.service';
import { AuthInterceptor } from '../auth/_interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { VideoCreateComponent } from './video-create/video-create.component';
import { VideoEditComponent } from './video-edit/video-edit.component';
import { VideoSearchComponent } from './video-search/video-search.component';
import { VideoService } from './_service/video.service';
import { VideoViewComponent } from './video-view/video-view.component';

const routes: Routes = [
  { path: 'search', component: VideoSearchComponent },
  { path: 'create', component: VideoCreateComponent },
  { path: 'edit/:id', component: VideoEditComponent },
  { path: ':id', component: VideoViewComponent }
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [VideoSearchComponent, VideoCreateComponent, VideoEditComponent, VideoViewComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    SearchUtil,
    VideoService,
    LookupService,
    ReportService
  ]
})
export class VideoModule {}
