import {AuthService} from '../../auth/_service/auth.service';
import {API_CREDENTIAL_GET_MENU} from '../../_const/api.const';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {NavigationList} from '../_model/nav.model';
import {Observable} from 'rxjs/internal/Observable';
import {retry} from 'rxjs/operators';

@Injectable()
export class NavService {

    constructor(
        private http: HttpClient,
        private authSvc: AuthService
    ) {
    }

    getNavigations(): Observable<NavigationList> {
        return this.http
            .get<NavigationList>(API_CREDENTIAL_GET_MENU, {headers: {'X-Auth-Token': this.authSvc.getAuth.token}})
            .pipe(
                retry(5)
            );
    }
}
