import {API_TGP_POST_SEARCH, API_TGP_GET_CANCEL, API_TGP_POST_GENERATE_COUPON, API_REPORT_GET_FILE} from '../../_const/api.const';
import {Observable} from 'rxjs';
import {TgpSearchTerm, TgpSearchItem, Tgp} from './tgp-search.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, retry} from 'rxjs/operators';
import {PaginatedResponse, SearchPagination} from '../../_model/app.model';


@Injectable()
export class TgpSearchService {

    constructor(private http: HttpClient) {
    }

    searchTgpList(term: SearchPagination<TgpSearchTerm>): Observable<PaginatedResponse<TgpSearchItem>> {

        return this.http.post<PaginatedResponse<TgpSearchItem>>(API_TGP_POST_SEARCH, term);

    }

    cancelTgp(headerId: string): Observable<Tgp> {

        return this.http.get<Tgp>(API_TGP_GET_CANCEL, {params: {tblHeaderid: headerId}});

    }

    closeTgp(params: any = null): Observable<any> {

        return this.http.post(API_TGP_POST_GENERATE_COUPON, params);

    }

    getFailedRecord(id: string): Observable<string> {

        return this.http
            .get(
                `${API_REPORT_GET_FILE}/XLSX/tgp_error_message`,
                {params: {reportId: id}, responseType: 'blob'}
            )
            .pipe(
                map(blob => URL.createObjectURL(blob))
            );

    }

}
