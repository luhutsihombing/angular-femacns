import {
    API_RESPONSIBILITY_DELETE,
    API_RESPONSIBILITY_GET,
    API_RESPONSIBILITY_GET_ALL_FUNCTIONS,
    API_RESPONSIBILITY_POST_SAVE,
    API_RESPONSIBILITY_POST_SEARCH,
    API_RESPONSIBILITY_POST_SEARCH_REPORT,
} from '../../_const/api.const';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
    Responsibility,
    ResponsibilityFunctions,
    ResponsibilitySave,
    ResponsibilitySearchItem,
    ResponsibilitySearchTerm,
} from '../_model/responsibility.model';
import {map} from 'rxjs/operators';
import {PaginatedResponse} from '../../_model/app.model';

@Injectable()
export class ResponsibilityService {

    constructor(public http: HttpClient) {
    }

    getAllFunctions(): Observable<ResponsibilityFunctions> {

        return this.http.get<ResponsibilityFunctions>(API_RESPONSIBILITY_GET_ALL_FUNCTIONS);

    }

    postResponsibilitySearchList(
        term: ResponsibilitySearchTerm = {name: '', peopleType: null}
    ): Observable<PaginatedResponse<ResponsibilitySearchItem>> {

        return this.http.post<PaginatedResponse<ResponsibilitySearchItem>>(API_RESPONSIBILITY_POST_SEARCH, term);

    }

    getResponsibility(id: string): Observable<Responsibility> {

        return this.http.get<Responsibility>(`${API_RESPONSIBILITY_GET}/${id}`);

    }

    deleteResponsibility(id: string): Observable<any> {

        return this.http.delete(`${API_RESPONSIBILITY_DELETE}/${id}`);

    }

    postCreateResponsibility(term: ResponsibilitySave): Observable<any> {

        return this.http.post(API_RESPONSIBILITY_POST_SAVE, JSON.stringify(term));

    }

    getDownloadUrl(terms: ResponsibilitySearchItem[]): Observable<string> {

        return this.http
            .post(API_RESPONSIBILITY_POST_SEARCH_REPORT, JSON.stringify(terms), {responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));

    }

}
