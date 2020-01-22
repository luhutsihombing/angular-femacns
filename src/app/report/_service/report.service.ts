import {PaginatedResponse} from '../../_model/app.model';
import {API_REPORT_GET_TGP_COUPON_XLSX, API_REPORT_POST_TGP_COUPON_JSON} from '../../_const/api.const';
import * as Papa from 'papaparse/papaparse.min';
import {
    API_HCMS_GET_ALL_BRANCH,
    API_HCMS_GET_EMPLOYEE_NPO_NPK,
    API_HCMS_GET_JOB_SUGGESTIONS,
    API_REPORT_GET_FILE
} from '../../_const/api.const';
import {Branch, Employee, Job, ReportData, ReportTgpDownloadTerm, ReportTgpItem, ReportTgpTerm} from '../_model/report.model';
import {first, map, switchMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ReportType} from '../_const/report-type.const';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class ReportService {

    constructor(private http: HttpClient) {
    }

    getDownloadUrl(rt: ReportType, params?: any): Observable<string> {

        for (const [key, value] of Object.entries(params)) {

            if (!value) {

                delete params[key];

            }

        }

        return this.http
            .get(`${API_REPORT_GET_FILE}/XLSX/${rt}`, {params, responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));

    }

    getSearchResults(rt: ReportType, params?: any): Observable<ReportData> {

        for (const [key, value] of Object.entries(params)) {

            if (!value) {

                delete params[key];

            }

        }

        const reportDataSubject = new Subject<ReportData>();

        return this.http
            .get(`${API_REPORT_GET_FILE}/CSV/${rt}_csv`, {params, responseType: 'blob'})
            .pipe(
                switchMap(csvBlob => {

                    Papa.parse(csvBlob, {
                        complete: parsedCsv => reportDataSubject.next({
                            header: parsedCsv.data[0],
                            entries: parsedCsv.data.slice(1, -1),
                        })
                    });

                    return new Observable<ReportData>(fn => reportDataSubject.subscribe(fn));
                }),
                first(),
                map(({header, entries}) => ({
                    header: header ? header : [],
                    entries: entries ? entries : []
                }))
            );

    }

    tgpSearchResults(term: ReportTgpTerm): Observable<PaginatedResponse<ReportTgpItem>> {

        return this.http.post<PaginatedResponse<ReportTgpItem>>(API_REPORT_POST_TGP_COUPON_JSON, term);

    }

    downloadTgp(term: ReportTgpDownloadTerm): Observable<string> {

        return this.http
            .get(API_REPORT_GET_TGP_COUPON_XLSX, {params: <any>term, responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));

    }

    getBranchHCMS(): Observable<Branch[]> {
        return this.http.get<Branch[]>(API_HCMS_GET_ALL_BRANCH);
    }

    getJobHCMS(): Observable<Job[]> {
        return this.http.get<Job[]>(API_HCMS_GET_JOB_SUGGESTIONS);
    }

    getNpk(name): Observable<Employee[]> {
        return this.http.get<Employee[]>(`${API_HCMS_GET_EMPLOYEE_NPO_NPK}/${name}`);
    }
}
