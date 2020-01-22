import {Observable} from 'rxjs';
import {API_TGP_GET_TGP} from '../../_const/api.const';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Tgp} from './tgp-view.model';

@Injectable()
export class TgpViewService {

    constructor(private http: HttpClient) {
    }

    getTgp(headerId: string): Observable<Tgp> {

        return this.http.get<Tgp>(API_TGP_GET_TGP, {params: {tblHeaderid: headerId}});

    }

}
