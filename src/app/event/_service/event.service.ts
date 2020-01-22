import {
    API_EVENT_GET_EVENT_SHARING,
    API_HCMS_GET_EMPLOYEE_NPO_NPK,
    API_EVENT_GET,
    API_EVENT_GET_RECEIVER_ERROR,
    API_EVENT_GET_SEND_REMINDER,
    API_EVENT_GET_SUGGESTION,
    API_EVENT_POST_RECEIVER,
    API_EVENT_POST_SAVE,
    API_EVENT_POST_SEARCH,
    API_EVENT_GET_PARTICIPANTS,
    API_EVENT_POST_EVENT_SHARING_REPORT,
    API_EVENT_POST_EVENT_ATTEND,
    API_EVENT_POST_EVENT_ATTEND_SURVEY
} from '../../_const/api.const';
import {
    Employee,
    Event as Evt,
    EventDetailItem,
    EventParticipant, EventParticipantItem,
    EventSave,
    EventSearchItem,
    EventSearchTerm,
    EventSuggestion
} from '../_model/event.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {GenericResponse, PaginatedResponse, SearchPagination} from '../../_model/app.model';

@Injectable()
export class EventService {

    constructor(private http: HttpClient) {
    }

    getEventId(id: string): Observable<Evt> {
        return this.http.get<Evt>(`${API_EVENT_GET}/${id}`);
    }

    getEventSuggestion(title: string): Observable<EventSuggestion[]> {
        return this.http.get<EventSuggestion[]>(`${API_EVENT_GET_SUGGESTION}/${title}`);
    }

    searchEventList(term: SearchPagination<EventSearchTerm>): Observable<PaginatedResponse<EventSearchItem>> {

        return this.http.post<PaginatedResponse<EventSearchItem>>(API_EVENT_POST_SEARCH, term);

    }

    saveEvent(event: EventSave): Observable<EventSave> {

        return this.http.post<EventSave>(API_EVENT_POST_SAVE, event);

    }

    registerParticipant(file: File, uploadId?: string): Observable<EventParticipant> {

        const formData = new FormData();

        formData.append('file', file, file.name.replace(/ /g, '.'));

        const httpObs = uploadId
            ? this.http.post<PaginatedResponse<EventParticipant>>(API_EVENT_POST_RECEIVER, formData, {params: {uploadId}})
            : this.http.post<PaginatedResponse<EventParticipant>>(API_EVENT_POST_RECEIVER, formData);

        return httpObs.pipe(map(response => response.data));

    }

    getFailedParticipant(uploadId: string): Observable<string> {

        return this.http
            .get(`${API_EVENT_GET_RECEIVER_ERROR}/${uploadId}`, {responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));

    }

    getDetailsEventId(id: string): Observable<EventDetailItem> {

        return this.http.get<PaginatedResponse<EventDetailItem>>(`${API_EVENT_GET_EVENT_SHARING}/${id}`)
            .pipe(map(response => response.data));

    }

    getSendReminder(id: string): Observable<any> {
        return this.http.get(`${API_EVENT_GET_SEND_REMINDER}/${id}`);
    }

    getNpk(name): Observable<Employee[]> {

        return this.http.get<Employee[]>(`${API_HCMS_GET_EMPLOYEE_NPO_NPK}/${name}`);

    }

    deleteEvent(id: string): Observable<GenericResponse> {

        return this.http.delete<GenericResponse>(`${API_EVENT_POST_SAVE}/${id}`);

    }

    getParticipants(uploadId: string): Observable<EventParticipant> {

        return this.http.get<EventParticipantItem[]>(`${API_EVENT_GET_PARTICIPANTS}/${uploadId}`)
            .pipe(map(participants => ({...{} as EventParticipant, successItems: participants})));

    }

    postDownloadUrl(terms: EventDetailItem): Observable<string> {

        return this.http
            .post(API_EVENT_POST_EVENT_SHARING_REPORT, JSON.stringify(terms), {responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));

    }

    postDownloadTotalAttend(eventId): Observable<string> {

        return this.http
            .post(API_EVENT_POST_EVENT_ATTEND, {}, {params: {eventId}, responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));
    }

    postDownloadTotalAttendSurvey(eventId): Observable<string> {

        return this.http
            .post(API_EVENT_POST_EVENT_ATTEND_SURVEY, {}, {params: {eventId}, responseType: 'blob'})
            .pipe(map(blob => URL.createObjectURL(blob)));
    }

}
