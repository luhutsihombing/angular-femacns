import {retry} from 'rxjs/operators';
import {
    API_CULTURE_GET_BRANCH,
    API_CULTURE_GET_BRANCH_SEARCH,
    API_AREA_POST_SEARCH,
    API_AREA_GET_ID,
    API_AREA_POST_SAVE,
    API_AREA_DELETE,
    API_CULTURE_GET_BRANCH_SEARCH_EDIT
} from '../../../_const/api.const';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Branch, AreaSearchTerm, AreaSearchItem, MappingArea, BranchSearch} from '../_model/mapping-area.model';
import {Observable} from 'rxjs/internal/Observable';
import {GenericResponse, PaginatedResponse, SearchPagination} from '../../../_model/app.model';

@Injectable()
export class MappingAreaService {

    constructor(private http: HttpClient) {
    }

    getAllBranch(): Observable<Branch[]> {

        return this.http
            .get<Branch[]>(API_CULTURE_GET_BRANCH)
            ;

    }

    getBranchName(branch: BranchSearch): Observable<Branch[]> {

        return this.http
            .post<Branch[]>(`${API_CULTURE_GET_BRANCH_SEARCH}`, branch);

    }

    getBranchNameEdit(branch: BranchSearch): Observable<Branch[]> {

        return this.http
            .post<Branch[]>(`${API_CULTURE_GET_BRANCH_SEARCH_EDIT}`, branch);

    }

    postAreaList(term: SearchPagination<AreaSearchTerm>): Observable<PaginatedResponse<AreaSearchItem>> {

        return this.http.post<PaginatedResponse<AreaSearchItem>>(API_AREA_POST_SEARCH, term);

    }

    getAreaId(id: string): Observable<MappingArea> {

        return this.http
            .get<MappingArea>(`${API_AREA_GET_ID}/${id}`)
            ;
    }

    postAreaSave(area): Observable<GenericResponse> {

        return this.http.post<GenericResponse>(API_AREA_POST_SAVE, JSON.stringify(area));

    }

    deleteArea(id: string): Observable<any> {

        return this.http.delete(`${API_AREA_DELETE}/${id}`);

    }
}
