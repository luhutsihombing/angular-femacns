import {AppComponent} from './app.component';
import {AppRoutesModule} from './app-routes.module';
import {AuthGuard} from './auth/_guard/auth.guard';
import {AuthService} from './auth/_service/auth.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {SharedModule} from './shared/shared.module';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutesModule,
        SharedModule,
    ],
    declarations: [AppComponent],
    providers: [AuthService, AuthGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}
