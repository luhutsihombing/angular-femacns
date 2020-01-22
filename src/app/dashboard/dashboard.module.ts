import {AuthInterceptor} from '../auth/_interceptor/auth.interceptor';
import {ChartsModule} from 'ng2-charts';
import {DashboardComponent} from './dashboard.component';
import {DashboardService} from './_service/dashboard.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {NotificationMessageViewComponent} from './notification-message-view/notification-message-view.component';
import {LookupService} from '../lookup/_service/lookup.service';

const routes: Routes = [
    {path: '', component: DashboardComponent},
    {path: 'notification/:id', component: NotificationMessageViewComponent},
];

@NgModule({
    imports: [SharedModule, RouterModule.forChild(routes), ChartsModule],
    declarations: [DashboardComponent, NotificationMessageViewComponent],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        DashboardService,
        LookupService
    ]
})
export class DashboardModule {
}
