import {GenericResponse, PaginatedResponse, SearchPagination} from '../../../_model/app.model';
import {
    API_HO_POST_SEARCH,
    API_GET_ORG_SUGGESTION,
    API_GET_HO_SUGGESTION,
    API_HO_POST_SAVE,
    API_HCMS_GET_EMPLOYEE_NPK,
    API_HO_GET_ID,
    API_HO_DELETE,
    API_HO_VALIDATE_CELL,
    API_HO_VALIDATE_PEMBINA,
    API_HO_VALIDATE_ORGANIZATION, API_HCMS_GET_EMPLOYEE_SUGGESTIONS
} from '../../../_const/api.const';
import {Observable} from 'rxjs/internal/Observable';
import {MappingHOTerm, MappingHoSearchItem, Organization, Employee, MappingHO} from '../_model/mapping-cell-ho.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';

@Injectable()
export class MappingHOService {

    constructor(private http: HttpClient) {
    }

    searchHoList(term: SearchPagination<MappingHOTerm>): Observable<PaginatedResponse<MappingHoSearchItem>> {

        return this.http.post<PaginatedResponse<MappingHoSearchItem>>(API_HO_POST_SEARCH, term);

    }

    getOrganizationSuggestions(): Observable<Organization[]> {

        return this.http.get<PaginatedResponse<Organization>>(API_GET_ORG_SUGGESTION)
            .pipe(map(response => response.dataList));

    }

    getHoSuggestions(): Observable<string[]> {

        return this.http.get<PaginatedResponse<MappingHoSearchItem>>(API_GET_HO_SUGGESTION)
            .pipe(map(response => response.dataList.map(ho => ho.cellName)));

    }

    getEmployeeSuggestions(name: string): Observable<Array<{ label: string; value: string }>> {

        return this.http.get<Employee[]>(`${API_HCMS_GET_EMPLOYEE_SUGGESTIONS}/${name}`)
            .pipe(map(employees =>
                employees.map(({username, fullName}) => ({label: fullName, value: `${username}-${fullName}`}))
            ));

    }

    save(ho): Observable<GenericResponse> {

        return this.http.post<GenericResponse>(API_HO_POST_SAVE, JSON.stringify(ho));

    }

    getHOById(id: string): Observable<MappingHO> {

        return this.http.get<PaginatedResponse<MappingHO>>(`${API_HO_GET_ID}${id}`)
            .pipe(map(response => response.data));

    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${API_HO_DELETE}${id}`);
    }

}
