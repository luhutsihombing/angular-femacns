import {HttpClient} from '@angular/common/http';
import {API_CONTENT_GET_SEARCH_SUGGESTION, API_CONTENT_POST_SEARCH} from '../../_const/api.const';
import {ContentSuggestion, ContentSearchTerm, ContentSearchItem} from '../_model/content.model';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {PaginatedResponse, SearchPagination} from '../../_model/app.model';

@Injectable()
export class ContentSearchService {

    constructor(private http: HttpClient) {
    }

    getContentSuggestion(title: string): Observable<ContentSuggestion[]> {

        return this.http.get<ContentSuggestion[]>(`${API_CONTENT_GET_SEARCH_SUGGESTION}/${title}`);

    }

    postContentList(term: SearchPagination<ContentSearchTerm>): Observable<PaginatedResponse<ContentSearchItem>> {

        return this.http.post<PaginatedResponse<ContentSearchItem>>(API_CONTENT_POST_SEARCH, term);

    }

}
