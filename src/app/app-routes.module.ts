import {NgModule} from '@angular/core';
import {AuthGuard} from './auth/_guard/auth.guard';
import {Routes, PreloadAllModules, RouterModule} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: './auth/auth.module#AuthModule'
    },
    {
        path: 'channel',
        loadChildren: './channel/channel.module#ChannelModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'comment',
        loadChildren: './comment/comment.module#CommentModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'content',
        loadChildren: './content/content.module#ContentModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'event',
        loadChildren: './event/event.module#EventModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'feedback',
        loadChildren: './feedback/feedback.module#FeedbackModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'lookup',
        loadChildren: './lookup/lookup.module#LookupModule',
        canActivate: [AuthGuard]
    },
    // {
    //   path: 'counterpart',
    //   loadChildren: './counterpart/counterpart.module#CounterpartModule',
    //   canActivate: [AuthGuard]
    // },
    {
      path: 'culture',
      loadChildren: './culture/culture.module#CultureModule',
      canActivate: [AuthGuard]
    },
    {
        path: 'pea',
        loadChildren: './pea/pea.module#PeaModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'responsibility',
        loadChildren: './responsibility/responsibility.module#ResponsibilityModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'report',
        loadChildren: './report/report.module#ReportModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'tgp',
        loadChildren: './tgp/tgp.module#TgpModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'user',
        loadChildren: './user/user.module#UserModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'video',
        loadChildren: './video/video.module#VideoModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'thinkware',
        loadChildren: './thinkware/thinkware.module#ThinkwareModule',
        canActivate: [AuthGuard]
    },

];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
    ],
    exports: [
        RouterModule,
    ]
})
export class AppRoutesModule {
}
