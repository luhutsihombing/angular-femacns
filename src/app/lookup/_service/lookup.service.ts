import {
    API_LOOKUP_GET,
    API_LOOKUP_GET_DETAIL_LIST,
    API_LOOKUP_GET_DETAIL_MEANING,
    API_LOOKUP_POST_SAVE,
    API_LOOKUP_POST_SEARCH
} from '../../_const/api.const';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
    Lookup, LookupDetail,
    LookupMeaning,
    LookupSaveTerm,
    LookupSearchTerm
} from '../_model/lookup.model';
import {Observable} from 'rxjs/internal/Observable';
import {map, retry} from 'rxjs/operators';
import {PaginatedResponse} from '../../_model/app.model';

@Injectable()
export class LookupService {
    constructor(public http: HttpClient) {
    }

    getLookupDetailList(name: string): Observable<PaginatedResponse<LookupDetail>> {
        return this.http.get<PaginatedResponse<LookupDetail>>(`${API_LOOKUP_GET_DETAIL_LIST}/${name}`);
    }

    getAccessTypes(): Observable<PaginatedResponse<LookupDetail>> {
        return this.getLookupDetailList('ACCESS_TYPE');
    }

    getPeopleTypes(): Observable<PaginatedResponse<LookupDetail>> {
        return this.getLookupDetailList('PEOPLE_TYPE');
    }

    getNewsCategories(): Observable<PaginatedResponse<LookupDetail>> {
        return this.getLookupDetailList('CON_NEWS_CATEGORY');
    }

    getLinkMenu(): Observable<PaginatedResponse<LookupDetail>> {
        return this.getLookupDetailList('CON_LINK_MENU');
    }

    getLookup(name: string): Observable<Lookup> {
        return this.http.get<Lookup>(`${API_LOOKUP_GET}/${name}`);
    }

    getNumericDetailMeaning(id: string): Observable<number> {

        return this.http
            .get<LookupMeaning>(`${API_LOOKUP_GET_DETAIL_MEANING}/${id}`)
            .pipe(
                retry(5),
                map(({numericValue}) => numericValue || null)
            );

    }

    getLookupDetailMeaning(id: string): Observable<any> {

        return this.http
            .get<LookupMeaning>(`${API_LOOKUP_GET_DETAIL_MEANING}/${id}`)
            .pipe(
                retry(5),
                map(lookupMeaning => {

                    if (lookupMeaning.hasOwnProperty('dateValue')) {

                        return <string>lookupMeaning.dateValue;

                    } else if (lookupMeaning.hasOwnProperty('numericValue')) {

                        return <number>lookupMeaning.numericValue;

                    } else if (lookupMeaning.hasOwnProperty('textValue')) {

                        return <string>lookupMeaning.textValue;

                    }

                    return null;

                })
            );

    }

    postSearch(term: LookupSearchTerm): Observable<PaginatedResponse<LookupDetail>> {
        return this.http.post<PaginatedResponse<LookupDetail>>(API_LOOKUP_POST_SEARCH, term);
    }

    postSave(term: LookupSaveTerm): Observable<Lookup> {
        return this.http.post<Lookup>(API_LOOKUP_POST_SAVE, term);
    }
}
