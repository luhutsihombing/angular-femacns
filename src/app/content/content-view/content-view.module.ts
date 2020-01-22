import { ContentViewBannerComponent } from './content-view-banner/content-view-banner.component';
import { ContentViewPopupComponent } from './content-view-popup/content-view-popup.component';
import { ContentViewNewsComponent } from './content-view-news/content-view-news.component';
import { ContentViewComponent } from './content-view.component';
import { ApiResourceService } from '../../_service/api-resource.service';
import { AuthInterceptor } from '../../auth/_interceptor/auth.interceptor';
import { ContentService } from '../_service/content.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LookupService } from '../../lookup/_service/lookup.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: ContentViewComponent }];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    ContentViewComponent,
    ContentViewNewsComponent,
    ContentViewPopupComponent,
    ContentViewBannerComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    LookupService,
    ApiResourceService,
    ContentService,
  ]
})
export class ContentViewModule { }
