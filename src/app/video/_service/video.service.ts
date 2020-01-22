import {
    API_VIDEO_DELETE,
    API_VIDEO_GET,
    API_VIDEO_GET_SUGGESTIONS,
    API_WISTIA_GET_API_PASSWORD,
    API_VIDEO_POST_SAVE,
    API_VIDEO_POST_SEARCH,
    API_VIDEO_POST_UNIQUE_TITLE,
    API_FEEDBACK_POST_MAPPING_SAVE,
    API_FEEDBACK_GET_TEMPLATE_SUGGESTION,
    API_FEEDBACK_GET_MAPPING_NAME,
    API_FEEDBACK_DELETE_MAPPING
} from '../../_const/api.const';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {Video, VideoSearchItem, VideoSearchTerm, VideoSuggestion} from '../_model/video.model';
import {WISTIA_UPLOAD} from '../../_const/wistia.const';
import {concatMap} from 'rxjs/operators';
import {PaginatedResponse, SearchPagination} from '../../_model/app.model';

@Injectable()
export class VideoService {

    constructor(
        private http: HttpClient
    ) {
    }

    private getWistiaApiKey(): Observable<string> {

        return this.http
            .get(API_WISTIA_GET_API_PASSWORD, {responseType: 'text'})
            ;

    }

    getVideo(id: string): Observable<Video> {

        return this.http
            .get<Video>(`${API_VIDEO_GET}/${id}`)
            ;

    }

    getVideoSuggestion(name: string): Observable<VideoSuggestion[]> {

        return this.http.get<VideoSuggestion[]>(`${API_VIDEO_GET_SUGGESTIONS}/${name}`);

    }

    postWistiaVideo(file: File): Observable<any> {

        return this
            .getWistiaApiKey()
            .pipe(
                concatMap(apiPassword => {

                    const formData = new FormData();

                    formData.append('file', file, file.name);
                    formData.append('api_password', apiPassword);

                    const req = new HttpRequest('POST', WISTIA_UPLOAD, formData, {reportProgress: true});

                    return this.http.request(req);

                })
            );

    }

    searchVideoList(term: SearchPagination<VideoSearchTerm>): Observable<PaginatedResponse<VideoSearchItem>> {

        return this.http.post<PaginatedResponse<VideoSearchItem>>(API_VIDEO_POST_SEARCH, term);

    }

    postSaveVideo(video: Video): Observable<any> {
        return this.http.post(API_VIDEO_POST_SAVE, video);
    }

    deleteVideo(id: string): Observable<any> {
        // return this.http.delete(`${API_VIDEO_DELETE}/${id}`);
        return this.http.request(new HttpRequest('DELETE', `${API_VIDEO_DELETE}/${id}`));
    }

    postValidateUniqueVideo(term: { id: string; title: string; }): Observable<any> {
        return this.http.post(API_VIDEO_POST_UNIQUE_TITLE, term);
    }

    getFeedbackSuggestion(): Observable<any> {
        return this.http.get(API_FEEDBACK_GET_TEMPLATE_SUGGESTION);
    }

    postFeedbackSave(feedback): Observable<any> {
        return this.http.post(API_FEEDBACK_POST_MAPPING_SAVE, feedback);
    }

    getFeedbackName(id: string): Observable<any> {
        return this.http.get(`${API_FEEDBACK_GET_MAPPING_NAME}${id}`);
    }

    deleteFeedbackTemplate(id: string): Observable<any> {
        return this.http.delete(`${API_FEEDBACK_DELETE_MAPPING}${id}`);
    }

}
