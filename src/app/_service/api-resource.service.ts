import {API_CONTENT_GET_GENERATE_PATH, API_DOMAIN, API_CONTENT_POST_UPLOAD} from '../_const/api.const';
import {ResourcePath, UploadedResourcePath} from '../content/_model/api-resource.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, retry} from 'rxjs/operators';

@Injectable()
export class ApiResourceService {

    constructor(public http: HttpClient) {
    }

    getPath(type: string): Observable<ResourcePath> {

        return this.http
            .get<ResourcePath>(`${API_CONTENT_GET_GENERATE_PATH}/${type}`)
            .pipe(
                retry(5),
                map(path => ({...path, downloadPath: API_DOMAIN + path.downloadPath}))
            );

    }

    upload(folder: string, file: File): Observable<string> {

        const formData = new FormData();

        formData.append('file', file, file.name.replace(/ /g, '.'));

        return this.http
            .post<UploadedResourcePath>(`${API_CONTENT_POST_UPLOAD}/${folder}`, formData)
            .pipe(map(path => API_DOMAIN + path.data));

    }

}
