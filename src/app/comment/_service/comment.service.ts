import {
    API_COMMENT_DELETE_NEWS,
    API_COMMENT_DELETE_VIDEO,
    API_COMMENT_POST_NEWS_DETAIL,
    API_COMMENT_POST_NEWS_SEARCH,
    API_COMMENT_POST_VIDEO_DETAIL,
    API_COMMENT_POST_VIDEO_SEARCH
} from '../../_const/api.const';
import {
    CommentDetailList,
    CommentDetailTerm,
    CommentSearchItem,
    CommentSearchTerm
} from '../_model/comment.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PaginatedResponse, SearchPagination} from '../../_model/app.model';

@Injectable()
export class CommentService {

    constructor(private http: HttpClient) {
    }

    postCommentSearchNews(term: SearchPagination<CommentSearchTerm>): Observable<PaginatedResponse<CommentSearchItem>> {

        return this.http.post<PaginatedResponse<CommentSearchItem>>(API_COMMENT_POST_NEWS_SEARCH, term);

    }

    postCommentSearchVideo(term: SearchPagination<CommentSearchTerm>): Observable<PaginatedResponse<CommentSearchItem>> {

        return this.http.post<PaginatedResponse<CommentSearchItem>>(API_COMMENT_POST_VIDEO_SEARCH, term);

    }

    deleteCommentByIdNews(id: string): Observable<any> {
        return this.http.delete(`${API_COMMENT_DELETE_NEWS}/${id}`);
    }

    deleteCommentByIdVideo(id: string): Observable<any> {
        return this.http.delete(`${API_COMMENT_DELETE_VIDEO}/${id}`);
    }

    postCommentDetailsNews(term: CommentDetailTerm): Observable<CommentDetailList> {
        return this.http.post<CommentDetailList>(API_COMMENT_POST_NEWS_DETAIL, term);
    }

    postCommentDetailsVideo(term: CommentDetailTerm): Observable<CommentDetailList> {
        return this.http.post<CommentDetailList>(API_COMMENT_POST_VIDEO_DETAIL, term);
    }
}
