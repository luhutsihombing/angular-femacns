import {API_CONTENT_SUGGESTION_VIEWER} from '../../_const/api.const';
import {
    API_CONTENT_DELETE,
    API_CONTENT_GET,
    API_CONTENT_GET_RECEIVER,
    API_CONTENT_GET_RECEIVER_ERROR,
    API_CONTENT_GET_SUGGESTION,
    API_CONTENT_GET_VALIDATE_DEFAULT_BANNER,
    API_CONTENT_POST_RECEIVER,
    API_CONTENT_POST_SAVE,
} from '../../_const/api.const';
import {ApiResourceService} from '../../_service/api-resource.service';
import {
    Content,
    ContentFormOptions,
    ContentLookups,
    ContentReceiverSummary, ContentReceiverSummaryItem,
    ContentResources,
    ContentSuggestion
} from '../_model/content.model';
import {CONTENT_RECEIVERS} from '../_const/content.const';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LookupService} from '../../lookup/_service/lookup.service';
import {STANDARD_LOOKUP_SELECTION, STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {Observable, combineLatest} from 'rxjs';
import {map, retry} from 'rxjs/operators';
import {PaginatedResponse} from '../../_model/app.model';

@Injectable()
export class ContentService {

    constructor(
        private http: HttpClient,
        private lookupSvc: LookupService,
        private resourceSvc: ApiResourceService
    ) {
    }

    getLookups(): Observable<ContentLookups> {

        return combineLatest(
            this.lookupSvc.getLookupDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getLookupDetailMeaning('GLOBAL_SETUP~CON_MAX_SIZE_BANNER'),
            this.lookupSvc.getLookupDetailMeaning('GLOBAL_SETUP~CON_MAX_BANNER_DESC'),
            this.lookupSvc.getLookupDetailMeaning('GLOBAL_SETUP~CON_MAX_SIZE_POPUP'),
            this.lookupSvc.getLookupDetailMeaning('GLOBAL_SETUP~CON_MAX_POPUP_DESC'),
        ).pipe(
            map(([minChar, maxBannerSize, maxBannerDesc, maxPopupSize, maxPopupDesc]) => ({
                maxBannerDesc,
                maxBannerSize,
                minChar,
                minPeriodStart: new Date().getTime(),
                maxPopupDesc,
                maxPopupSize,
                minPublishDate: new Date().toISOString().split('T')[0]
            }))
        );

    }

    getFormOptions(): Observable<ContentFormOptions> {

        return combineLatest(
            this.lookupSvc.getNewsCategories(),
            this.lookupSvc.getLinkMenu(),
        )
            .pipe(
                map(([newsCats, links]) => ({
                    newsCategories: STANDARD_LOOKUP_SELECTION.concat(newsCats.dataList),
                    linkMenu: STANDARD_LOOKUP_SELECTION.concat(
                        links.dataList.map(linkMenu => ({
                            ...linkMenu,
                            detailCode: linkMenu.detailCode.replace(/_/g, ' ')
                        }))
                    ),
                    contentReceivers: STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS)
                }))
            );

    }

    getResources(): Observable<ContentResources> {

        return combineLatest(
            this.resourceSvc.getPath('NEWS'),
            this.resourceSvc.getPath('BANNER'),
            this.resourceSvc.getPath('POPUP'),
        ).pipe(map(([news, banner, popup]) => ({news, banner, popup})));

    }

    getContent(id: string): Observable<Content> {

        return this.http.get<Content>(`${API_CONTENT_GET}/${id}`)
            .pipe(
                retry(5),
                map(content => ({
                    ...content,
                    publishDate: typeof content.publishDate === 'number'
                        ? new Date(content.publishDate).toISOString().split('T')[0] : ''
                }))
            );

    }

    getContentSuggestion(title: string): Observable<ContentSuggestion[]> {

        return this.http.get<ContentSuggestion[]>(`${API_CONTENT_GET_SUGGESTION}/${title}`);

    }

    defaultBannerIsExist(): Observable<boolean> {

        return this.http
            .get<{ isFound: boolean }>(API_CONTENT_GET_VALIDATE_DEFAULT_BANNER)
            .pipe(retry(5), map(({isFound}) => isFound));

    }

    getNewsHMTL(url: string): Observable<string> {

        // url = 'http://localhost:5000/news-4c04fb88ed73a5a5bcde3a32f0402a82193a04d0554919b964116d226cbe6612.html'

        return this.http.get(url, {responseType: 'text'});

    }

    postReceiverFile(file: File, uploadId?: string): Observable<ContentReceiverSummary> {

        const formData = new FormData();
        formData.append('file', file, file.name.replace(/ /g, '.'));

        const request = uploadId
            ? this.http.post<PaginatedResponse<ContentReceiverSummary>>(API_CONTENT_POST_RECEIVER, formData, {params: {uploadId}})
            : this.http.post<PaginatedResponse<ContentReceiverSummary>>(API_CONTENT_POST_RECEIVER, formData);

        return request.pipe(map(results => results.data as ContentReceiverSummary));

    }

    getFailedReceiver(uploadId: string): Observable<string> {

        return this.http
            .get(`${API_CONTENT_GET_RECEIVER_ERROR}/${uploadId}`, {responseType: 'blob'})
            .pipe(
                retry(5),
                map(blob => URL.createObjectURL(blob))
            );

    }

    saveContent(content: Content): Observable<Content> {

        return this.http.post<Content>(API_CONTENT_POST_SAVE, content);

    }

    deleteContent(id: string): Observable<any> {

        return this.http.delete(`${API_CONTENT_DELETE}/${id}`);

    }

    getExistingReceiver(contentId: string): Observable<ContentReceiverSummaryItem[]> {

        return this.http
            .get<PaginatedResponse<ContentReceiverSummaryItem>>(`${API_CONTENT_GET_RECEIVER}/${contentId}`)
            .pipe(map(response => response.dataList as ContentReceiverSummaryItem[]));

    }

    getViewerHistorySuggestion(): Observable<string[]> {
        return this.http.get<string[]>(`${API_CONTENT_SUGGESTION_VIEWER}`);
    }

}
