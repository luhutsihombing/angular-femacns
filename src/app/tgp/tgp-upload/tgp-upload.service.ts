import {
    API_REPORT_GET_FILE,
    API_TGP_GET_TEMPLATE,
    API_TGP_POST_FILE,
    API_TGP_POST_GENERATE_COUPON
} from '../../_const/api.const';
import {filter, map, retry} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {TgpProcess, TgpUpload} from './tgp-upload.model';
import {ErrorResponse, GenericResponse, PaginatedResponse} from '../../_model/app.model';

@Injectable()
export class TgpUploadService {

    constructor(private http: HttpClient) {
    }

    getTemplate(): Observable<string> {

        return this.http
            .get(API_TGP_GET_TEMPLATE, {responseType: 'blob'})
            .pipe(
                retry(5),
                map(blob => URL.createObjectURL(blob))
            );

    }

    process(file: File, tgpUpload: TgpUpload): Observable<PaginatedResponse<TgpProcess>> {

        const formData = new FormData();

        formData.append('file', file);
        formData.append(
            'json',
            new Blob([JSON.stringify(tgpUpload)], {type: 'application/json'})
        );

        const req = new HttpRequest('POST', API_TGP_POST_FILE, formData);

        return this.http.request(req)
            .pipe(
                filter(response => response instanceof HttpErrorResponse || response.hasOwnProperty('body')),
                map(response => {

                    if (response instanceof HttpErrorResponse) {
                        throw response.error as ErrorResponse;
                    }

                    return response['body'] as PaginatedResponse<TgpProcess>;

                })
            );

    }

    getFailedRecord(id: string): Observable<string> {

        return this.http
            .get(
                `${API_REPORT_GET_FILE}/XLSX/tgp_error_message`,
                {params: {reportId: id}, responseType: 'blob'}
            )
            .pipe(
                map(blob => URL.createObjectURL(blob))
            );

    }

    generateCoupon(): Observable<GenericResponse> {

        return this.http.post<GenericResponse>(API_TGP_POST_GENERATE_COUPON, null);

    }

}
