import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, retry} from 'rxjs/operators';
import {API_HCMS_GET_UPLOAD_TEMPLATE, API_HCMS_GET_UPLOAD_TEMPLATE_TGP} from '../_const/api.const';

@Injectable()
export class HcmsService {

    constructor(private http: HttpClient) {
    }

    getUploadTemplate(): Observable<string> {

        return this.http
            .get(API_HCMS_GET_UPLOAD_TEMPLATE, {responseType: 'blob'})
            .pipe(
                map(blob => URL.createObjectURL(blob)),
                retry(5)
            );

    }

    getUploadTemplateTGP(): Observable<string> {

        return this.http
            .get(API_HCMS_GET_UPLOAD_TEMPLATE_TGP, {responseType: 'blob'})
            .pipe(
                map(blob => URL.createObjectURL(blob)),
                retry(5)
            );

    }

}
