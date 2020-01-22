import {
    API_AUTH_POST_LOGIN,
    API_AUTH_POST_REFRESH_TOKEN,
    API_AUTH_POST_INVALIDATE_TOKEN
} from '../../_const/api.const';
import {Auth, Login} from '../_model/auth.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {Router} from '@angular/router';
import {User} from '../../user/_model/user.model';
import {finalize, map, retry, tap} from 'rxjs/operators';

@Injectable()
export class AuthService {

    private auth: Auth;
    private user: User;

    get getAuth(): Auth {
        return this.auth;
    }

    get isAuthenticated(): boolean {
        return this.auth && this.auth.validUntil > new Date().getTime();
    }

    constructor(private http: HttpClient, private router: Router) {

        this.auth = sessionStorage.getItem('cmsAuth')
            ? JSON.parse(sessionStorage.getItem('cmsAuth')) : {} as Auth;

        this.user = sessionStorage.getItem('ctmUser')
            ? JSON.parse(sessionStorage.getItem('ctmUser')) : {} as User;

    }

    // Get auth and user details during log-in process
    postLogin(login: Login): Observable<Auth> {

        const formData = new FormData();
        formData.append('username', login.username);
        formData.append('password', login.password);

        return this.http
            .post<Auth>(
                API_AUTH_POST_LOGIN,
                formData,
                // new HttpParams().set('username', login.username)
                //                 .set('password', login.password),
                {
                    headers: {
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Access-Type': 'WEB'
                    }
                },
            )
            .pipe(
                map(auth => {
                    this.auth = auth;
                    sessionStorage.setItem('cmsAuth', JSON.stringify(this.auth));

                    return this.auth;

                })
            );

    }

    postRefreshToken(): Observable<Auth> {

        return this.http
            .post<Auth>(
                API_AUTH_POST_REFRESH_TOKEN,
                {data: this.auth.refreshToken},
                {headers: {'X-Auth-Token': this.auth.token, 'X-Access-Type': 'WEB'}}
            )
            .pipe(tap(auth => this.auth = auth));

    }

    // Clear all auth and user details, return to login page
    doLogout(queryParams: { next: string } = {next: '/dashboard'}): void {

        this.http.get(API_AUTH_POST_INVALIDATE_TOKEN, {headers: {'X-Auth-Token': this.auth.token}})
            .pipe(
                retry(5),
                finalize(() => this.router.navigate(
                    ['/auth/login'],
                    {queryParams: {...queryParams, next: queryParams.next.split('?')[0]}}
                    ).then(() => null)
                )
            )
            .subscribe(() => {

                this.auth = undefined;
                this.user = undefined;

                sessionStorage.clear();

            });

    }

}
