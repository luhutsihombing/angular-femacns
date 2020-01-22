import {API_DOMAIN} from '../../_const/api.const';
import {ReportBeritaAcaraSearchTerm, ReportBeritaAcara} from './report-berita-acara.model';
import {API_REPORT_GET_ACTIVITIES, API_REPORT_POST_ACTIVITIES_SEARCH} from '../../_const/api.const';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {PaginatedResponse, SearchPagination} from '../../_model/app.model';
import {ReportActivity} from '../_model/report.model';

@Injectable()
export class ReportBeritaAcaraService {

    constructor(private http: HttpClient) {
    }

    getById(id: string): Observable<ReportActivity> {

        return this.http.get<PaginatedResponse<ReportActivity>>(`${API_REPORT_GET_ACTIVITIES}/${id}`)
            .pipe(map(response => response.data));

    }

    search(term: SearchPagination<ReportBeritaAcaraSearchTerm>): Observable<PaginatedResponse<ReportBeritaAcara>> {
        return this.http.post<PaginatedResponse<ReportBeritaAcara>>(API_REPORT_POST_ACTIVITIES_SEARCH, term);
    }

    downloadAttachment(url: string): Observable<string> {

        return this.http
            .get(`${API_DOMAIN}`.concat(url), {responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));

    }

}
