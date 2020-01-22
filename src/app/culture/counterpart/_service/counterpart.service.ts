import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
    CounterpartSearchTerm,
    CounterpartSave,
    CellAreaCounterpart,
    Employee,
    Counterpart,
    CounterpartSearchItem
} from '../_model/counterpart.model';
import {
    API_COUNTERPART_POST_SEARCH,
    API_HCMS_GET_EMPLOYEE_NPK,
    API_COUNTERPART_POST_SAVE,
    API_COUNTERPART_DELETE,
    API_AREA_SUGGESTION,
    API_COUNTERPART_GET_NAME_SUGGESTION,
    API_COUNTERPART_GET_COUNTERPART, API_COUNTERPART_GET_ACTIVE_SUGGESTION, API_HCMS_GET_EMPLOYEE_SUGGESTIONS
} from '../../../_const/api.const';
import {map} from 'rxjs/operators';
import {GenericResponse, PaginatedResponse, SearchPagination} from '../../../_model/app.model';

@Injectable()
export class CounterpartService {

    constructor(public http: HttpClient) {
    }

    postCounterpartList(term: SearchPagination<CounterpartSearchTerm>): Observable<PaginatedResponse<CounterpartSearchItem>> {

        return this.http.post<PaginatedResponse<CounterpartSearchItem>>(API_COUNTERPART_POST_SEARCH, term);

    }

    getCellAreas(): Observable<CellAreaCounterpart[]> {

        return this.http.get<CellAreaCounterpart[]>(API_COUNTERPART_GET_COUNTERPART);

    }

    getById(id: string): Observable<Counterpart> {

        return this.http.get<PaginatedResponse<Counterpart>>(`${API_COUNTERPART_GET_COUNTERPART}/${id}`)
            .pipe(map(response => response.data));

    }

    getEmployeeSuggestions(name: string): Observable<Employee[]> {

        return this.http.get<Employee[]>(`${API_HCMS_GET_EMPLOYEE_SUGGESTIONS}/${name}`);

    }

    save(term: CounterpartSave): Observable<GenericResponse> {

        return this.http.post<GenericResponse>(API_COUNTERPART_POST_SAVE, JSON.stringify(term));

    }

    delete(id: string): Observable<any> {

        return this.http.delete(`${API_COUNTERPART_DELETE}${id}`);

    }

    getAreaSuggestions(): Observable<string[]> {

        return this.http.get<string[]>(`${API_AREA_SUGGESTION}`);

    }

    getActiveEmployeeSuggestions(): Observable<string[]> {

        return this.http.get<PaginatedResponse<string>>(`${API_COUNTERPART_GET_ACTIVE_SUGGESTION}`)
            .pipe(map(response => response.dataList.map(employee => `${employee}`.split('-').join('~'))));

    }

    getNameSuggestions(): Observable<{[key: string]: string}> {

        return this.http.get<PaginatedResponse<{[key: string]: string}>>(API_COUNTERPART_GET_NAME_SUGGESTION)
            .pipe(map(response => response.data));

    }

}
