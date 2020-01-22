import {
    API_NOTIFICATION_POST_FIND_ALL,
    API_REPORT_POST_YEARLY_USER_ACCESS,
    API_NOTIFICATION_GET_DETAIL,
    API_DASHBOARD_BANNER_ACTIVE,
    API_DASHBOARD_EVENT_ACTIVE,
    API_DASHBOARD_EVENT_UPCOMING,
    API_DASHBOARD_NEWS_MOST_LIKED,
    API_DASHBOARD_NEWS_MOST_VIEWED,
    API_USER_TOTAL_ACCESS,
    API_DASHBOARD_EVENT_FEEDBACK,
    API_FEEDBACK_POST_TOTAL_RESPONDENTS, API_REPORT_POST_USER_SESSION
} from '../../_const/api.const';
import {HttpClient} from '@angular/common/http';
import {combineLatest, Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {map, switchMap} from 'rxjs/operators';
import {PaginatedResponse} from '../../_model/app.model';
import {Event as Evt} from '../../event/_model/event.model';
import {ContentBanner} from '../../content/_model/content.model';
import {DashboardFeedbackEvent, DashboardNotification, DashboardYearlyUserAccess, NotificationMessage} from '../_model/dashboard.model';

@Injectable()
export class DashboardService {

    constructor(private http: HttpClient) {
    }

    yearlyUserAccess(): Observable<DashboardYearlyUserAccess[]> {

        return this.http.post<DashboardYearlyUserAccess[]>(
            `${API_REPORT_POST_YEARLY_USER_ACCESS}/${new Date().getFullYear()}`,
            null
        );

    }

    downloadUserAccess(yearlyUserAccess: DashboardYearlyUserAccess[]): Observable<Blob> {

        return this.http.post(API_REPORT_POST_USER_SESSION, yearlyUserAccess, {responseType: 'blob'});

    }

    getNotificationList(page: { currentPage: number }): Observable<PaginatedResponse<DashboardNotification>> {

        return this.http.post<PaginatedResponse<DashboardNotification>>(API_NOTIFICATION_POST_FIND_ALL, page);

    }

    getNotificationDetail(id: string): Observable<NotificationMessage> {

        return this.http.get<NotificationMessage>(`${API_NOTIFICATION_GET_DETAIL}/${id}`);

    }

    mostLikedNews(): Observable<Array<{ count: number, title: string }>> {

        return this.http.get<Array<{ count: number, title: string }>>(API_DASHBOARD_NEWS_MOST_LIKED);

    }

    mostViewedNews(): Observable<Array<{ count: number, title: string }>> {

        return this.http.get<Array<{ count: number, title: string }>>(API_DASHBOARD_NEWS_MOST_VIEWED);

    }

    activeBanners({currentPage, pageSize}): Observable<PaginatedResponse<ContentBanner>> {

        return this.http.post<PaginatedResponse<ContentBanner>>(API_DASHBOARD_BANNER_ACTIVE, {currentPage, pageSize});

    }

    activeEvents({currentPage, pageSize}): Observable<PaginatedResponse<Evt>> {

        return this.http.post<PaginatedResponse<Evt>>(API_DASHBOARD_EVENT_ACTIVE, {currentPage, pageSize});

    }

    feedbackEvents({currentPage, data}): Observable<PaginatedResponse<DashboardFeedbackEvent>> {

        return this.http.post<PaginatedResponse<DashboardFeedbackEvent>>(
            API_DASHBOARD_EVENT_FEEDBACK,
            {currentPage, data}
        )
            .pipe(
                switchMap(response => {

                    if (response.dataList.length === 0) {
                        return response.dataList.length === 0 ? combineLatest(of(response), of([])) : of(null);
                    }

                    return combineLatest(
                        of(response),
                        this.http.post<{ [key: string]: string; }>(
                            API_FEEDBACK_POST_TOTAL_RESPONDENTS,
                            response.dataList.map(feedbackEvent => feedbackEvent.id)
                        ));

                }),
                map(([response, totalRespondents]) => (<PaginatedResponse<DashboardFeedbackEvent>>{
                    ...response,
                    dataList: response.dataList.map(feedbackEvent => ({
                        ...feedbackEvent,
                        totalRespondents: totalRespondents.hasOwnProperty(feedbackEvent.id)
                            ? totalRespondents[feedbackEvent.id] : 0
                    }))
                })),
                map(feedbackEvents => ({
                    ...feedbackEvents,
                    dataList: feedbackEvents.dataList.map(feedbackEvent => ({
                        ...feedbackEvent,
                        respondentsPercentage: +((feedbackEvent.totalRespondents / feedbackEvent.totalTarget) * 100).toFixed(2)
                    }))
                }))
            );

    }

    upcomingEvents({currentPage, pageSize}): Observable<PaginatedResponse<Evt>> {

        return this.http.post<PaginatedResponse<Evt>>(API_DASHBOARD_EVENT_UPCOMING, {currentPage, pageSize});

    }

    totalUserAccess(): Observable<number> {

        const startDate = new Date(new Date().getFullYear(), 0, 1);

        return this.http.post<PaginatedResponse<number>>(API_USER_TOTAL_ACCESS, {
            startDate: startDate.toISOString().split('T')[0],
            timeSpanMinutes: Math.round((new Date().getTime() - startDate.getTime()) / 60000) + 1440,
        }).pipe(map(response => response.data));

    }

}
