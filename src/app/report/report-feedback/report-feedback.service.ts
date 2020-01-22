import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ReportFeedbackQuestion, ReportFeedbackSearchTerm} from '../_model/report.model';
import {API_FEEDBACK_GET_REPORT_QUESTION_LIST} from '../../_const/api.const';
import {map} from 'rxjs/operators';
import {PaginatedResponse} from '../../_model/app.model';

@Injectable()
export class ReportFeedbackService {

    constructor(private http: HttpClient) {
    }

    getQuestionList(searchQuery: ReportFeedbackSearchTerm):
        Observable<Array<ReportFeedbackQuestion>> {

        return this.http
            .post<PaginatedResponse<ReportFeedbackQuestion>>(
                API_FEEDBACK_GET_REPORT_QUESTION_LIST,
                {data: searchQuery.eventName}
            )
            .pipe(
                map(paginatedQuestionList => paginatedQuestionList.dataList)
            );

    }

}
