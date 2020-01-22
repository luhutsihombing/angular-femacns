import {
    API_HCMS_GET_EMPLOYEE_NPO_NPK,
    API_THINKWARE_GET,
    API_THINKWARE_POST_SAVE,
    API_THINKWARE_POST_SEARCH,
    API_THINKWARE_DELETE,
    API_THINKWARE_POST_THINKWARE_SHARING_REPORT,
    API_THINKWARE_POST_THINKWARE_ATTEND,
    API_THINKWARE_POST_THINKWARE_ATTEND_SURVEY,
    API_HCMS_GET_BRANCH_NAME,
    API_THINKWARE_POST_UPDATE_FILES,
    API_THINKWARE_GET_TITLE_SUGGESTION,
    API_THINKWARE_GET_BRANCH_SUGGESTION,
    API_THINKWARE_GET_CODE_SUGGESTION,
    API_HCMS_POST_PIC_VALIDATION,
    API_THINKWARE_GET_DEPARTMENT,
    API_THINKWARE_GET_UPLOADED_FILE,
    API_THINKWARE_GET_MEMBER_LEAD_SUGGESTION,
    API_THINKWARE_GET_MEMBER_LEAD_SUGGESTION_IS_ACTIVE,
    API_THINKWARE_GET_SUPERVISOR,
    API_THINKWARE_GET_GL_CODE,
    API_THINKWARE_GET_GLCODE_FROM_BRANCHCODE,
    API_THINKWARE_GET_DEPT_2,
    API_THINKWARE_GET_EMPLOYEE_SUGGESTION,
    API_THINKWARE_GET_TOOLTIP_II,
    API_THINKWARE_GET_TOOLTIP_SS,
    API_THINKWARE_GET_TOOLTIP_QCP,
    API_THINKWARE_GET_TOOLTIP_QCC,
} from '../../_const/api.const';
import {
    Employee,
    Thinkware as ThinkW,
    ThinkwareDetailItem,
    ThinkwareSave,
    ThinkwareSearchItem,
    ThinkwareSearchTerm,
    ThinkwareSuggestion,
    BranchName,
    BranchNameMapList,
    CodeSuggestion,
    TitleSuggestion,
    BranchSuggestion,
    IsPIC,
    Supervisors,
    Department,
    GlcodeSuggestion,
    GlCodeMapList,
    Dept2
} from '../_model/thinkware.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, concatMap} from 'rxjs/operators';
import {PaginatedResponse, SearchPagination} from '../../_model/app.model';
import {ApiResourceService} from '../../_service/api-resource.service';
import {UploadedResourcePath} from '../_model/api-resource.model';
import {API_DOMAIN, API_THINKWARE_POST_UPLOAD} from '../../_const/api.const';


@Injectable()
export class ThinkwareService {

    constructor(
        private http: HttpClient,
        private resourceSvc: ApiResourceService
    ) {}

    // service ini digunakan untuk upload file attachment pertama kali
    upload(files: any[], types: string[], codeProject: string, count: number ): Observable<string> {
        const formData = new FormData();

        for (let index = 0; index < files.length; index++) {
            if (files[index].file) {
                const fileType = files[index].file.name.split('.');
                const ext = fileType[fileType.length - 1];
                formData.append('files', files[index].file, codeProject + '-' + (count + index + 1) + '.' + ext);
            }
        }

        return this.http
            .post<UploadedResourcePath>(`${API_THINKWARE_POST_UPLOAD}/`, formData)
            .pipe(map(path => API_DOMAIN + path.data));

    }

    // service ini dugunakan untuk upload update file attachment
    updateFile(files: any[], idFolder: string, codeProject: string, count: number): Observable<string> {

        const formData = new FormData();

        // memasukkan file yang akan diupload ke dalam formData
        for (let index = 0; index < files.length; index++) {
            if (files[index].file) {
                const fileType = files[index].file.name.split('.');
                const ext = fileType[fileType.length - 1];
                formData.append('files', files[index].file, codeProject + '--' + (count + index + 1) + '.' + ext);
            }
        }

        // memasukkan nama file yang akan dihapus ke dalam formData
        for (let index = 0; index < files.length; index++) {
            if (files[index].before) {
                formData.append('filePath', files[index].before);
            }
        }

        formData.append('subfolder', idFolder);

        return this.http
            .post<UploadedResourcePath>(API_THINKWARE_POST_UPDATE_FILES, formData)
            .pipe(map(path => API_DOMAIN + path.data));

    }

    // service untuk mencari keterangan PIC atau bukan dari username login
    getIsPIC(username: string): Observable<IsPIC> {

        const formData = new FormData();

        return this.http.get<IsPIC>(API_HCMS_POST_PIC_VALIDATION + '/' + username);
    }

    getToolTipII() {
        return this.http.get<any>(API_THINKWARE_GET_TOOLTIP_II);
    }

    getToolTipQCC() {
        return this.http.get<any>(API_THINKWARE_GET_TOOLTIP_QCC);
    }

    getToolTipQCP() {
        return this.http.get<any>(API_THINKWARE_GET_TOOLTIP_QCP);
    }

    getToolTipSS() {
        return this.http.get<any>(API_THINKWARE_GET_TOOLTIP_SS);
    }

    // service untuk membuat path atau folder di server agar bisa menampung file yang akan diupload
    getUploadedFile(uuidFolder: string): Observable<string[]> {
        return this.http.post<string[]>(`${API_THINKWARE_GET_UPLOADED_FILE}/${uuidFolder}`, null);
    }

    // service untuk mendapatkan supervisor
    getSupervisor(personId: string, companyId: string): Observable<Supervisors> {
        return this.http.get<Supervisors>(`${API_THINKWARE_GET_SUPERVISOR}/?compId=${companyId}&personId=${personId}`);
    }

    // service untuk mendapatkan department2 / organization level 2
    getDepartmentLvl2(supervisor: string): Observable<Department> {
        return this.http.get<Department>(`${API_THINKWARE_GET_DEPARTMENT}/${supervisor}`);
    }

    // service untuk mendapatkan list dari namaBranch berdasarkan glCode yang dikirim
    getBranchName(idBranchList: BranchName[]): Observable<BranchNameMapList[]> {
        return this.http.post<BranchNameMapList[]>(`${API_HCMS_GET_BRANCH_NAME}/`, idBranchList);
    }

    // service untuk mendapatkan glCode dari branchCode *1 data, digunakan saat suggestion
    getGlCode(branchCode: string[]): Observable<GlcodeSuggestion> {
        return this.http.get<GlcodeSuggestion>(`${API_THINKWARE_GET_GL_CODE}/${branchCode}`);
    }

    // service untuk mendapatkan list glCode dari branchCode, digunakan pada searchList
    getGlCodes(branchCode: string[]): Observable<GlCodeMapList[]> {
        return this.http.post<GlCodeMapList[]>(`${API_THINKWARE_GET_GLCODE_FROM_BRANCHCODE}/`, branchCode);
    }

    // service untuk mendapatkan data project thinkware digunakan untuk edit dan view
    getThinkwareId(id: string): Observable<ThinkW> {
        return this.http.get<ThinkW>(`${API_THINKWARE_GET}/${id}`);
    }

    getThinkwareSuggestion(nama: string): Observable<ThinkwareSuggestion[]> {
        return this.http.get<ThinkwareSuggestion[]>(`${API_THINKWARE_GET_EMPLOYEE_SUGGESTION}?userOrName=${nama}`);
    }

    // service yang digunakan untuk mendapatkan suggestion employee untuk leader dan member
    getThinkwareSuggest(branch: string, nama: string): Observable<ThinkwareSuggestion[]> {
        return this.http.get<ThinkwareSuggestion[]>
        // (`${API_THINKWARE_GET_MEMBER_LEAD_SUGGESTION}?branchCode=${branch}&userOrName=${nama}`);
        (`${API_THINKWARE_GET_MEMBER_LEAD_SUGGESTION_IS_ACTIVE}?branchCode=${branch}&userOrName=${nama}`);
    }

    // service untuk mendapatkan department2 atau organization level 2
    getDept2(personId: string, employeeNo: string): Observable<Dept2> {
        const a = this.http.get<Dept2>(`${API_THINKWARE_GET_DEPT_2}?personId=${personId}&employeeNo=${employeeNo}`);
        return a;
    }

    // getThinkwareMember(nama: string, branch: string): Observable<ThinkwareSuggestion[]> {
    //     return this.http.get<ThinkwareSuggestion[]>(`${API_THINKWARE_GET_MEMBER_SUGGESTION}?userOrfullName=${nama}&idBranch=${branch}`);
    // }

    // getThinkwareLead(nama: string): Observable<ThinkwareSuggestion[]> {
    //     return this.http.get<ThinkwareSuggestion[]>(`${API_THINKWARE_GET_LEAD_SUGGESTION}/${nama}`);
    // }

    // service untuk mendapatkan suggestion title project untuk search
    getTitleSuggestion(title: string): Observable<TitleSuggestion[]> {
        return this.http.get<TitleSuggestion[]>(`${API_THINKWARE_GET_TITLE_SUGGESTION}/${title}`);
    }

    // service untuk mendapatkan branch suggestion untuk search
    getBranchSuggestion(branch: string): Observable<BranchSuggestion[]> {
        return this.http.get<BranchSuggestion[]>(`${API_THINKWARE_GET_BRANCH_SUGGESTION}/${branch}`);
    }

    // service untuk mendapatkan suggesttion codeProject untuk search
    getCodeSuggestion(code: string): Observable<CodeSuggestion[]> {
        return this.http.get<CodeSuggestion[]>(`${API_THINKWARE_GET_CODE_SUGGESTION}/${code}`);
    }

    // service untuk melakukan search
    searchThinkwareList(term: SearchPagination<ThinkwareSearchTerm>): Observable<PaginatedResponse<ThinkwareSearchItem>> {
        return this.http.post<PaginatedResponse<ThinkwareSearchItem>>(API_THINKWARE_POST_SEARCH, term);
    }

    // service untuk melakukan save project thinkware
    saveThinkware(thinkware: ThinkwareSave): Observable<ThinkwareSave> {

        return this.http.post<ThinkwareSave>(API_THINKWARE_POST_SAVE, thinkware);

    }

    // service untuk mendapatkan npk employee
    getNpk(name): Observable<Employee[]> {

        return this.http.get<Employee[]>(`${API_HCMS_GET_EMPLOYEE_NPO_NPK}/${name}`);

    }

    // service untuk melakukan delete pada project thinkware
    deleteThinkware(id: string): Observable<any> {

        return this.http.delete(`${API_THINKWARE_DELETE}/${id}`);

    }

    // buat dwonload laporan nanti
    postDownloadUrl(terms: ThinkwareDetailItem): Observable<string> {

        return this.http
            .post(API_THINKWARE_POST_THINKWARE_SHARING_REPORT, JSON.stringify(terms), {responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));

    }

    postDownloadTotalAttend(thinkwareId): Observable<string> {

        return this.http
            .post(API_THINKWARE_POST_THINKWARE_ATTEND, {}, {params: {thinkwareId}, responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));
    }

    postDownloadTotalAttendSurvey(thinkwareId): Observable<string> {

        return this.http
            .post(API_THINKWARE_POST_THINKWARE_ATTEND_SURVEY, {}, {params: {thinkwareId}, responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));
    }

}
