import {AuthService} from '../_service/auth.service';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {JSON_HEADERS_ENDPOINT_EXCEPTIONS} from '../../_const/interceptor.const';
import {Router} from '@angular/router';
import {WISTIA_UPLOAD} from '../../_const/wistia.const';
import {catchError, switchMap} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private authSvc: AuthService
    ) {
    }

    private requestIsAuthenticated(requestURL: string): boolean {

        const apiResourceRegex = new RegExp(
            'https://fema-dev.fifgroup.co.id/fema_resources/m1likk17ab3r5ama/[\0-9a-z]+/news-[\0-9a-z]+.html'
        );

        return !(
            requestURL === WISTIA_UPLOAD
            || requestURL.match(apiResourceRegex)
            || requestURL === 'http://localhost:5000/news-4c04fb88ed73a5a5bcde3a32f0402a82193a04d0554919b964116d226cbe6612.html'
        );

    }

    private requestIsJson(requestURL: string): boolean {

        return !JSON_HEADERS_ENDPOINT_EXCEPTIONS.reduce(
            (prev, exceptionURL) => (prev ? true : requestURL.includes(exceptionURL)),
            false
        );

    }

    private processingRequest(req: HttpRequest<any>, next: HttpHandler) {

        let newReq: HttpRequest<any> = req.clone();

        if (this.requestIsAuthenticated(req.url)) {
            newReq = newReq.clone({setHeaders: {'X-Auth-Token': this.authSvc.getAuth.token}});

            // Prevents request caching
            switch (newReq.method) {

                case 'POST':
                    newReq = newReq.clone({
                        setHeaders: {
                            'Cache-Control': 'no-cache',
                            'Cache-control': 'no-store',
                            Expires: '0',
                            Pragma: 'no-cache'
                        }
                    });
                    break;

                case 'GET':
                    newReq = newReq.clone({setParams: {time: new Date().getTime().toString()}});
                    break;

            }

            // Add JSON Content-Type headers for any request requires it
            if (this.requestIsJson(req.url)) {
                newReq = newReq.clone({setHeaders: {'Content-Type': 'application/json'}});
            }
        }

        return next
            .handle(newReq)
            .pipe(
                catchError(error => {

                    if (error.status === 401 && this.requestIsAuthenticated(req.url)) {

                        this.authSvc.doLogout({next: this.router.routerState.snapshot.url});

                    }

                    const newError = error.hasOwnProperty('error') && error.error.hasOwnProperty('message')
                        ? error.error : error;

                    return throwError(newError);
                })
            );
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const under5Minutes: boolean = this.authSvc.getAuth.validUntil - new Date().getTime() <= 180000;

        if (under5Minutes) {

            return this.authSvc.postRefreshToken().pipe(switchMap(() => this.processingRequest(req, next)));

        }

        return this.processingRequest(req, next);

    }
}
