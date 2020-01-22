import {DefaultResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
    API_USER_GET,
    API_USER_POST_SEARCH,
    API_USER_POST_SAVE,
    API_HCMS_GET_ALL_BRANCH,
    API_HCMS_GET_ALL_ORGANIZATIONS,
    API_HCMS_GET_JOB_SUGGESTIONS,
    API_USER_GET_NEXT_USERNAME
} from '../../_const/api.const';
import {Observable} from 'rxjs/internal/Observable';
import {
    User,
    UserSearchTerm,
    Branch,
    Organization,
    Job, UserSearchItem
} from '../_model/user.model';

@Injectable()
export class UserService {

    constructor(private http: HttpClient) {
    }

    getUserDetails(username: string): Observable<User> {

        return this.http.get<User>(`${API_USER_GET}/${username}`);

    }

    getBranchHCMS(): Observable<Branch[]> {

        return this.http.get<Branch[]>(API_HCMS_GET_ALL_BRANCH);

    }

    getOrgzHCMS(): Observable<Organization[]> {

        return this.http.get<Organization[]>(API_HCMS_GET_ALL_ORGANIZATIONS);

    }

    getJobHCMS(): Observable<Job[]> {

        return this.http.get<Job[]>(API_HCMS_GET_JOB_SUGGESTIONS);

    }

    searchUserList(rawTerm: SearchPagination<UserSearchTerm>): Observable<PaginatedResponse<UserSearchItem>> {

        const {data, ...others} = rawTerm;
        const term = {...data, ...others};

        return this.http.post<PaginatedResponse<UserSearchItem>>(API_USER_POST_SEARCH, term);

    }

    postUserSave(user: User): Observable<any> {

        const userData: User = {
            ...user,
            birthDate: typeof user.birthDate === 'string' ? user.birthDate : user.birthDate.format('YYYY-MM-DD')
        };

        return this.http.post<DefaultResponse>(API_USER_POST_SAVE, userData);

    }

    generateUsername(peopleType: string): Observable<string> {

        return this.http.get(`${API_USER_GET_NEXT_USERNAME}/${peopleType}`, {responseType: 'text'});

    }

}
