import {Subject} from 'rxjs';
import {ClrDatagridStateInterface} from '@clr/angular';
import {Observable} from 'rxjs/internal/Observable';
import * as $ from 'jquery';
import {CommentDetailTerm, CommentDetailList} from '../_model/comment.model';
import {CommentService} from '../_service/comment.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {concatMap, debounceTime} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';

@Component({
    selector: 'fema-cms-comment-view',
    templateUrl: './comment-view.component.html',
    styleUrls: ['./comment-view.component.scss']
})
export class CommentViewComponent implements OnInit {
    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    clrPage: Subject<ClrDatagridStateInterface>;

    error: any;
    id: string;
    idDelete: string;
    module: string;
    title: string;
    responseOnDelete: any;
    commentDetailList: CommentDetailList;

    deleteModalOpened: boolean;
    isOpenSuccess: boolean;

    constructor(
        private activatedRoute: ActivatedRoute,
        private location: Location,
        private router: Router,
        private commentService: CommentService
    ) {
        this.title = '';
        this.clrPage = new Subject<ClrDatagridStateInterface>();
    }

    ngOnInit() {
        this.commentDetailList = {} as CommentDetailList;

        this.clrPage.pipe(debounceTime(300)).subscribe(state => this.initViewCommentDetails(state));
    }

    private initViewCommentDetails(state?: ClrDatagridStateInterface): void {
        this.activatedRoute.params
            .pipe(
                concatMap(params => {
                    this.id = params.id;
                    this.module = params.type;

                    const term = {
                        ...({} as CommentDetailTerm),
                        currentPage: state && state.page ? +state.page.from / +state.page.size + 1 : 1,
                        data: {id: params.id}
                    };

                    switch (params.type) {
                        case 'NEWSINFO':
                            return this.commentService.postCommentDetailsNews(term);

                        case 'FIFTUBE':
                            return this.commentService.postCommentDetailsVideo(term);

                        default:
                            return of({} as CommentDetailList);
                    }
                })
            )
            .subscribe(
                commentDetailList => {
                    this.commentDetailList = commentDetailList;
                    if (this.commentDetailList.dataList[0]) {
                        this.title = this.commentDetailList.dataList[0].title;
                    }
                },
                error => this.error = error
            );
    }

    openDeleteModal(id): void {
        this.idDelete = id;
        this.deleteModalOpened = true;
    }

    closeModal(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }
        this.initViewCommentDetails();
        this.isOpenSuccess = false;
        this.deleteModalOpened = false;
    }

    delete(): void {
        let deleteObs: Observable<any>;

        switch (this.module) {
            case 'NEWSINFO':
                deleteObs = this.commentService.deleteCommentByIdNews(this.idDelete);
                break;

            case 'FIFTUBE':
                deleteObs = this.commentService.deleteCommentByIdVideo(this.idDelete);
                break;
        }

        deleteObs.subscribe(
            () => {
                this.deleteModalOpened = false;
                this.isOpenSuccess = true;
            },
            error => {
                this.responseOnDelete = error;
                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
            }
        );
    }

    back(evt?: Event): void {
        if (evt) {
            evt.preventDefault();
        }
        this.location.back();
    }
}
