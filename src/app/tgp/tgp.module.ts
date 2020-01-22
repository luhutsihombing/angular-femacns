import { HcmsService } from './../_service/hcms.service';
import { ReportService } from './../report/_service/report.service';
import { TgpModalProcessComponent } from './tgp-modal-process/tgp-modal-process.component';
import { TgpModalCloseComponent } from './tgp-modal-close/tgp-modal-close.component';
import { TgpModalCancelComponent } from './tgp-modal-cancel/tgp-modal-cancel.component';
import { AuthInterceptor } from '../auth/_interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchUtil } from '../_util/search.util';
import { SharedModule } from '../shared/shared.module';
import { TgpSearchComponent } from './tgp-search/tgp-search.component';
import { TgpSearchService } from './tgp-search/tgp-search.service';
import { TgpUploadComponent } from './tgp-upload/tgp-upload.component';
import { TgpUploadService } from './tgp-upload/tgp-upload.service';
import { TgpViewComponent } from './tgp-view/tgp-view.component';
import { TgpViewService } from './tgp-view/tgp-view.service';
import { TgpModalFailedRecordComponent } from './tgp-modal-failed-record/tgp-modal-failed-record.component';

const routes: Routes = [
    { path: 'upload', component: TgpUploadComponent },
    { path: 'search', component: TgpSearchComponent },
    { path: 'view/:headerId', component: TgpViewComponent },
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes)],
    declarations: [
        TgpModalProcessComponent,
        TgpModalCloseComponent,
        TgpModalCancelComponent,
        TgpUploadComponent,
        TgpSearchComponent,
        TgpViewComponent,
        TgpModalFailedRecordComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        SearchUtil,
        TgpUploadService,
        TgpSearchService,
        TgpViewService,
        ReportService,
        HcmsService
    ]
})
export class TgpModule { }
