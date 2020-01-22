import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FeedbackService} from '../_service/feedback.service';
import {FeedbackSequence} from '../_model/feedback.model';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize, first, switchMap} from 'rxjs/operators';
import {FormBuilder} from '@angular/forms';
import {ActionResponse, ErrorResponse, HTMLInputEvent} from '../../_model/app.model';
import * as $ from 'jquery';
import {Location} from '@angular/common';

@Component({
    selector: 'fema-cms-feedback-change-sequence',
    templateUrl: './feedback-change-sequence.component.html',
    styleUrls: ['./feedback-change-sequence.component.scss'],
})
export class FeedbackChangeSequenceComponent implements AfterViewInit, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    feedbackSequence: FeedbackSequence;
    categorySeqRange: number[];
    questionSeqRange: number[];

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        activeCategorySeq: number;
        activeQuestionSeq: number;
        cancelModalIsOpen: boolean;
        isSaving: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
    };

    readonly ngForTracker = (idx: number): number => idx;

    get categorySeq(): number[] {
        return this.feedbackSequence ? this.feedbackSequence.categories.map((v, i) => i + 1) : [];
    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private loc: Location,
        private router: Router,
        private feedbackSvc: FeedbackService,
    ) {

        this.uiState = {
            activeCategorySeq: 1,
            activeQuestionSeq: 1,
            isSaving: false,
            cancelModalIsOpen: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false
        };

        this.categorySeqRange = [];
        this.questionSeqRange = [];

    }

    ngOnInit() {

        this.initialSetup();

    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    getQuestionSeq(category: FeedbackSequence['categories'][0]): number[] {
        return this.feedbackSequence ? category.questions.map((v, i) => i + 1) : [];
    }

    back(evt: Event): void {

        evt.preventDefault();

        if (sessionStorage.getItem('cmsfeedbackSearchUrl')) {

            this.router.navigateByUrl(sessionStorage.getItem('cmsfeedbackSearchUrl')).then();

        } else {

            this.router.navigate(['/feedback/search']).then();

        }

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveModalIsOpen = true;

    }

    closeModal(evt: Event): void {

        evt.preventDefault();

        this.uiState.cancelModalIsOpen = false;

    }

    initialSetup(): void {

        this.ar.params
            .pipe(
                first(),
                switchMap(({id}) => this.feedbackSvc.getSequenceList(id))
            )
            .subscribe(
                feedbackSequence => this.feedbackSequence = feedbackSequence,
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    save(): void {

        this.uiState.isSaving = true;

        this.feedbackSvc
            .saveSequence(this.feedbackSequence)
            .pipe(
                finalize(() => {

                    this.uiState.isSaving = false;

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                success => {
                    this.responseOnAction = success;
                    this.uiState.saveSuccessModalIsOpen = true;
                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    setActiveCategorySeq(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.uiState.activeCategorySeq = +evt.target.value;

    }

    setActiveQuestionSeq(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.uiState.activeQuestionSeq = +evt.target.value;

    }

    swapCategory(currentCatIdx: number, currentValue: string): void {

        let targetCatIdx: number = this.feedbackSequence.categories
            .findIndex(category => category.sequenceCategoryNum === +currentValue);

        if (targetCatIdx === currentCatIdx) {

            targetCatIdx = this.feedbackSequence.categories
                .slice(currentCatIdx)
                .findIndex(category => category.sequenceCategoryNum === +currentValue);

        }

        if (targetCatIdx > -1) {

            this.feedbackSequence.categories[targetCatIdx].sequenceCategoryNum =
                this.feedbackSequence.categories[currentCatIdx].sequenceCategoryNum;

            this.feedbackSequence.categories[currentCatIdx].sequenceCategoryNum = +currentValue;

        } else {

            if (this.feedbackSequence.categories[currentCatIdx].sequenceCategoryNum === this.uiState.activeCategorySeq) {

                this.feedbackSequence.categories[currentCatIdx].sequenceCategoryNum = +currentValue;

            } else {

                this.feedbackSequence.categories[currentCatIdx].sequenceCategoryNum = this.uiState.activeCategorySeq;

            }

        }

    }

    swapQuestion(
        category: FeedbackSequence['categories'][0],
        queIdx: number,
        currentValue: string
    ): void {

        let seqQueIdx: number = category.questions
            .findIndex(question => question.sequenceNum === +currentValue);

        if (seqQueIdx === queIdx) {

            seqQueIdx = category.questions
                .slice(queIdx)
                .findIndex(question => question.sequenceNum === +currentValue);

        }

        if (seqQueIdx > -1) {

            category.questions[seqQueIdx].sequenceNum = category.questions[queIdx].sequenceNum;

            category.questions[queIdx].sequenceNum = +currentValue;

        } else {

            if (category.questions[queIdx].sequenceNum === this.uiState.activeQuestionSeq) {

                category.questions[queIdx].sequenceNum = +currentValue;

            } else {

                category.questions[queIdx].sequenceNum = this.uiState.activeQuestionSeq;

            }

        }

    }

}
