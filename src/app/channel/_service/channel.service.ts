import {
    API_CHANNEL_GET,
    API_CHANNEL_POST_SAVE,
    API_CHANNEL_POST_SEARCH,
    API_CHANNEL_DELETE,
    API_CHANNEL_GET_SUGGESTION,
    API_CHANNEL_POST_VIEWER,
    API_CHANNEL_GET_RECEIVER_ERROR,
    API_CHANNEL_GET_RECEIVER
} from '../../_const/api.const';
import {ApiResourceService} from '../../_service/api-resource.service';
import {
    Channel,
    ChannelSave,
    ChannelSearchItem,
    ChannelSearchTerm,
    ChannelSuggestion,
    ChannelViewerSummary,
    ChannelViewerSummaryItem
} from '../_model/channel.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ResourcePath} from '../../content/_model/api-resource.model';
import {map, retry} from 'rxjs/operators';
import {PaginatedResponse, SearchPagination} from '../../_model/app.model';

@Injectable()
export class ChannelService {

    constructor(
        private http: HttpClient,
        private resourceSvc: ApiResourceService
    ) {
    }

    getChannelResourcePath(): Observable<ResourcePath> {

        return this.resourceSvc.getPath('CHANNEL');

    }

    getChannel(id: string): Observable<Channel> {

        return this.http.get<Channel>(`${API_CHANNEL_GET}/${id}`);

    }

    postChannelSearchList(term: SearchPagination<ChannelSearchTerm>): Observable<PaginatedResponse<ChannelSearchItem>> {

        return this.http.post<PaginatedResponse<ChannelSearchItem>>(API_CHANNEL_POST_SEARCH, term);

    }

    postChannelSave(channel: ChannelSave): Observable<any> {

        return this.http.post(API_CHANNEL_POST_SAVE, channel);

    }

    getChannelSuggestion(name: string): Observable<ChannelSuggestion[]> {
        return this.http.get<ChannelSuggestion[]>(`${API_CHANNEL_GET_SUGGESTION}/${name}`);
    }

    deleteVideo(id: string): Observable<any> {
        return this.http.delete(`${API_CHANNEL_DELETE}/${id}`);
    }

    postReceiverFile(file: File, uploadId?: string): Observable<ChannelViewerSummary> {

        const formData = new FormData();
        formData.append('file', file, file.name.replace(/ /g, '.'));

        const request = uploadId
            ? this.http.post<PaginatedResponse<ChannelViewerSummary>>(API_CHANNEL_POST_VIEWER, formData, {params: {uploadId}})
            : this.http.post<PaginatedResponse<ChannelViewerSummary>>(API_CHANNEL_POST_VIEWER, formData);

        return request.pipe(map(results => results.data as ChannelViewerSummary));

    }

    getFailedReceiver(uploadId: string): Observable<string> {

        return this.http
            .get(`${API_CHANNEL_GET_RECEIVER_ERROR}/${uploadId}`, {responseType: 'blob'})
            .pipe(
                retry(5),
                map(blob => URL.createObjectURL(blob))
            );

    }

    getExistingMember(channelId: string): Observable<ChannelViewerSummaryItem[]> {

        return this.http
            .get<ChannelViewerSummaryItem[]>(`${API_CHANNEL_GET_RECEIVER}/${channelId}`)
            .pipe(map(response => response as ChannelViewerSummaryItem[]));

    }
}
