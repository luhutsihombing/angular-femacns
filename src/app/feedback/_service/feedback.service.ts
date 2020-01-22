import {Feedback, FeedbackTemplateSuggestion} from '../_model/feedback.model';
import {
    API_FEEDBACK_POST_SAVE,
    API_FEEDBACK_POST_SEARCH,
    API_FEEDBACK_GET,
    API_FEEDBACK_GET_SEQUENCE,
    API_FEEDBACK_POST_SAVE_SEQUENCE,
    API_FEEDBACK_DELETE,
    API_FEEDBACK_GET_TEMPLATE_SUGGESTION,
    API_FEEDBACK_GET_ITEM_SUGGESTION,
    API_FEEDBACK_DELETE_MAPPING,
    API_FEEDBACK_POST_MAPPING_SAVE, API_FEEDBACK_GET_NAME
} from '../../_const/api.const';
import {FemaOption, GenericResponse, PaginatedResponse} from '../../_model/app.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LookupService} from '../../lookup/_service/lookup.service';
import {map, retry} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {STANDARD_LOOKUP_SELECTION} from '../../_const/standard.const';
import {FeedbackSave, FeedbackSearchItem, FeedbackSearchTerm, FeedbackSequence, FeedbackEventSuggestion} from '../_model/feedback.model';

@Injectable()
export class FeedbackService {

    defaultFemaOptions: Array<FemaOption>;

    constructor(
        private http: HttpClient,
        private lookupSvc: LookupService,
    ) {

        this.defaultFemaOptions = STANDARD_LOOKUP_SELECTION.map(
            ({id, meaning}) => ({detailCode: id, meaning})
        );

    }

    getQuestionCategories(): Observable<Array<FemaOption>> {

        return this.lookupSvc
            .getLookupDetailList('FEEDBACK_QUESTION_CATEGORY')
            .pipe(
                retry(5),
                map(response => this.defaultFemaOptions.concat(
                    response.dataList.map(({detailCode, meaning}) => ({detailCode, meaning}))
                    )
                )
            );

    }

    getAnswerTypes(): Observable<Array<FemaOption>> {

        return this.lookupSvc
            .getLookupDetailList('FEEDBACK_GLOBAL_SETTING')
            .pipe(map(response => this.defaultFemaOptions.concat(
                response.dataList.map(({detailCode, meaning}) => ({detailCode, meaning}))
            )));

    }

    search(formValue: FeedbackSearchTerm): Observable<FeedbackSearchItem[]> {

        return this.http
            .post<PaginatedResponse<FeedbackSearchItem>>(API_FEEDBACK_POST_SEARCH, formValue)
            .pipe(map(response => response.dataList));

    }

    save(feedback: FeedbackSave): Observable<GenericResponse> {

        return this.http.post<GenericResponse>(API_FEEDBACK_POST_SAVE, JSON.stringify(feedback));

    }

    getFeedback(id: string): Observable<Feedback> {

        return this.http
            .get<PaginatedResponse<Feedback>>(`${API_FEEDBACK_GET}/${id}`)
            .pipe(
                retry(5),
                map(response => response.data),
            );

    }

    getSequenceList(id: string): Observable<FeedbackSequence> {

        return this.http
            .get<PaginatedResponse<FeedbackSequence>>(`${API_FEEDBACK_GET_SEQUENCE}/${id}`)
            .pipe(map(response => response.data as FeedbackSequence));

    }

    saveSequence(feedbackSequence: FeedbackSequence): Observable<any> {

        return this.http
            .post(API_FEEDBACK_POST_SAVE_SEQUENCE, feedbackSequence);

    }

    getEventSuggestions(): Observable<FeedbackEventSuggestion[]> {

        return this.http
            .get<PaginatedResponse<FeedbackEventSuggestion>>(`${API_FEEDBACK_GET_ITEM_SUGGESTION}`)
            .pipe(
                retry(5),
                map(response => response.dataList)
            );

    }

    getTemplateSuggestions(): Observable<FeedbackTemplateSuggestion[]> {

        return this.http
            .get<PaginatedResponse<FeedbackTemplateSuggestion>>(`${API_FEEDBACK_GET_TEMPLATE_SUGGESTION}`)
            .pipe(
                retry(5),
                map(response => response.dataList)
            );

    }

    delete(id: string): Observable<any> {

        return this.http.delete(`${API_FEEDBACK_DELETE}/${id}`);

    }

    getNameFromEvent(id: string): Observable<any> {

        return this.http.get(`${API_FEEDBACK_GET_NAME}${id}`);

    }

    saveEventMapping(feedback): Observable<any> {

        return this.http.post(API_FEEDBACK_POST_MAPPING_SAVE, feedback);

    }

    deleteEventMapping(id: string): Observable<GenericResponse> {

        return this.http.delete<GenericResponse>(`${API_FEEDBACK_DELETE_MAPPING}/${id}`);

    }

}
