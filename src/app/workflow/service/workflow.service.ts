import {
    API_WORKFLOW_POST_SAVE,
    API_WORKFLOW_POST_SEARCH,
    API_WORKFLOW_GET
} from '../../_const/api.const';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {SearchPagination, SearchPaginationWorkflow} from '../../_model/app.model';
import { WorkflowSave, WorkflowSearch,  WorkflowSearchItem, Workflow } from '../model/workflow.model';
import { PaginatedResponses } from '../../dashboard/_model/dashboard.model';

@Injectable()
export class WorkflowService {
    constructor(public http: HttpClient) {
    }
    // service untuk melakukan save project thinkware
    saveThinkware(workflow: WorkflowSave): Observable<WorkflowSave> {

        return this.http.post<WorkflowSave>(API_WORKFLOW_POST_SAVE, workflow);

    }

    postAreaList(term: SearchPaginationWorkflow<WorkflowSearch>): Observable<PaginatedResponses<WorkflowSearchItem>> {

        return this.http.post<PaginatedResponses<WorkflowSearchItem>>(API_WORKFLOW_POST_SEARCH, term);

    }

    // service untuk mendapatkan data project Workflow digunakan untuk edit dan view
    getSetupId(id: string): Observable<Workflow> {
        return this.http.get<Workflow>(`${API_WORKFLOW_GET}/${id}`);
    }
    
}
