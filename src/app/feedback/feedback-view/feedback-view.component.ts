import {ErrorResponse, FemaOption, ActionResponse} from '../../_model/app.model';
import {Feedback} from '../_model/feedback.model';
import {FeedbackService} from '../_service/feedback.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, FormArray, AbstractControl} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {filter, finalize, switchMap} from 'rxjs/operators';
import {combineLatest, from, Observable, Subject} from 'rxjs';

@Component({
    selector: 'fema-cms-feedback-view',
    templateUrl: './feedback-view.component.html',
    styleUrls: ['./feedback-view.component.scss']
})

export class FeedbackViewComponent implements OnInit {

    formOptions: {
        answerTypes: Array<FemaOption>;
        questionCategories: Array<FemaOption>;
    };

    feedbackForm: FormGroup;
    pageChangeEventSubject: Subject<void>;
    feedback: Feedback;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        cancelModalIsOpen: boolean;
        categoryIdx: number;
        deleteFailedModalIsOpen: boolean;
        deleteModalIsOpen: boolean;
        deleteSuccessModalIsOpen: boolean;
        questionIdx: number;
        nextCategoryIsPressed: boolean;
        nextQuestionIsPressed: boolean;
    };

    get categoriesForm(): FormArray {
        return <FormArray>this.feedbackForm.get('categories');
    }

    get questionsForm(): FormArray {
        return <FormArray>this.categoriesForm.at(this.uiState.categoryIdx).get('questions');
    }

    get isFirstCategory(): boolean {
        return this.uiState.categoryIdx === 0;
    }

    get isLastCategory(): boolean {
        return this.uiState.categoryIdx === this.categoriesForm.controls.length - 1;
    }

    get isFirstQuestion(): boolean {
        return this.uiState.questionIdx === 0;
    }

    get isLastQuestion(): boolean {
        return this.uiState.questionIdx === this.questionsForm.controls.length - 1;
    }

    private createCategory(): FormGroup {

        return this.fb.group({
            questionCategory: {value: '', disabled: true},
            questionPage: 1,
            questions: this.fb.array([this.createQuestion()]),
        });

    }

    private createQuestion(): FormGroup {

        return this.fb.group({
            allowFillIn: {value: false, disabled: true},
            choices: this.fb.array([]),
            dateFormat: {value: '', disabled: true},
            defaultValue: {value: '', disabled: true},
            image: {value: '', disabled: true},
            maxNumCharacters: {value: 0, disabled: true},
            numOfRange: {value: '', disabled: true},
            numOfLinesEditing: {value: '', disabled: true},
            question: {value: '', disabled: true},
            ratingScale: {value: '', disabled: true},
            required: {value: false, disabled: true},
            typeOfAnswerValue: {value: '', disabled: true},
            typeOfAnswerLabel: {value: '', disabled: true}
        });

    }

    constructor(
        public ar: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private feedbackSvc: FeedbackService,
    ) {

        this.pageChangeEventSubject = new Subject<void>();

        this.feedbackForm = fb.group({
            categories: fb.array([]),
            description: {value: '', disabled: true},
            feedbackId: {value: '', disabled: true},
            needCalculation: {value: false, disabled: true},
            templateName: {value: '', disabled: true},
        });

        this.uiState = {
            cancelModalIsOpen: false,
            categoryIdx: 0,
            deleteFailedModalIsOpen: false,
            deleteModalIsOpen: false,
            deleteSuccessModalIsOpen: false,
            questionIdx: 0,
            nextCategoryIsPressed: false,
            nextQuestionIsPressed: false,
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams =>
                    !qParams.hasOwnProperty('categorySeq')
                    || !qParams.hasOwnProperty('questionSeq')
                    || !this.feedbackForm.get('feedbackId').value
                ),
                switchMap(() => this.ar.params),
                switchMap(({id}) => this.feedbackSvc.getFeedback(id))
            )
            .subscribe(
                feedback => {

                    this.uiState = {
                        ...this.uiState,
                        categoryIdx: 0,
                        questionIdx: 0
                    };

                    this.feedbackForm.patchValue(feedback);

                    for (const category of feedback.categories) {

                        const categoryForm: FormGroup = this.createCategory();
                        (<FormArray>categoryForm.get('questions')).removeAt(0);

                        categoryForm.patchValue(category);

                        this.categoriesForm.push(categoryForm);

                        for (const question of category.questions) {

                            const questionForm: FormGroup = this.createQuestion();

                            questionForm.patchValue(question);

                            switch (question.typeOfAnswerValue) {

                                case 'MULTIPLE_CHOICE':

                                    for (const choice of question.choices) {

                                        const choiceControl = this.fb.control(choice);
                                        choiceControl.disable();

                                        (<FormArray>questionForm.get('choices')).push(choiceControl);

                                    }

                                    break;

                                case 'SINGLE_LINE_OF_TEXT':
                                    break;

                            }

                            (<FormArray>categoryForm.get('questions')).push(questionForm);

                        }

                    }

                    this.router
                        .navigate(
                            ['/feedback', this.feedbackForm.get('feedbackId').value],
                            {
                                queryParams: {categorySeq: 1, questionSeq: 1},
                                queryParamsHandling: 'merge'
                            }
                        )
                        .then();

                },
                error => this.errorOnInit = error
            );

        combineLatest(
            this.ar.queryParams,
            this.feedbackForm.valueChanges,
            this.feedbackForm.statusChanges
        )
            .pipe(
                filter(([qParams]) =>
                    qParams.categorySeq
                    && qParams.questionSeq
                    && this.feedbackForm.get('feedbackId').value
                ),
            )
            .subscribe(([qParams]) => {

                this.uiState = {
                    ...this.uiState,
                    categoryIdx: +qParams.categorySeq - 1,
                    questionIdx: +qParams.questionSeq - 1
                };

                const categoryDoesNotExist: boolean =
                    this.uiState.categoryIdx >= this.categoriesForm.length
                    || this.uiState.categoryIdx < 0;

                if (categoryDoesNotExist) {

                    this.navigateToQuestionPage(0)
                        .pipe(switchMap(() => this.navigateToCategoryPage(0)))
                        .subscribe();

                } else {

                    const questionDoesNotExist: boolean =
                        this.uiState.questionIdx >= this.questionsForm.length
                        || this.uiState.questionIdx < 0;

                    if (questionDoesNotExist) {

                        this.navigateToQuestionPage(0).subscribe();

                    }

                }

            });

        this.pageChangeEventSubject.asObservable().subscribe(() => {

            const questionPageIdx: number = this.feedbackForm
                .get(['categories', this.uiState.categoryIdx, 'questionPage']).value - 1;

            if (questionPageIdx > this.uiState.questionIdx) {

                if (!this.isLastQuestion) {
                    this.navigateToQuestionPage(questionPageIdx).subscribe();
                }

            } else if (questionPageIdx < this.uiState.questionIdx) {

                if (this.uiState.questionIdx > 0) {
                    this.navigateToQuestionPage(questionPageIdx).subscribe();
                }

            }

        });

    }


    initialSetup(): void {

        combineLatest(
            this.feedbackSvc.getQuestionCategories(),
            this.feedbackSvc.getAnswerTypes(),
        ).subscribe(
            ([questionCategories, answerTypes]) => this.formOptions = {questionCategories, answerTypes},
            error => this.errorOnInit = error
        );

    }

    changeQuestionPage(evt: KeyboardEvent): void {

        evt.preventDefault();
        this.pageChangeEventSubject.next();

    }

    isActiveCategory(idx: number): boolean {
        return this.uiState.categoryIdx === idx;
    }

    isActiveQuestion(idx: number): boolean {
        return this.uiState.questionIdx === idx;
    }

    navigateToCategoryPage(idx: number): Observable<boolean> {

        return from(this.router.navigate(
            ['/feedback', this.feedbackForm.get('feedbackId').value],
            {
                queryParams: {categorySeq: idx + 1},
                queryParamsHandling: 'merge',

            }
        )).pipe(finalize(() => this.uiState.nextCategoryIsPressed = false));

    }

    navigateToQuestionPage(idx: number): Observable<boolean> {

        return from(this.router.navigate(
            ['/feedback', this.feedbackForm.get('feedbackId').value],
            {
                queryParams: {questionSeq: idx + 1},
                queryParamsHandling: 'merge',
            }
        )).pipe(finalize(() => this.uiState.nextQuestionIsPressed = false));

    }

    prevCategory(evt: Event): void {

        evt.preventDefault();

        if (this.uiState.categoryIdx > 0) {

            this.navigateToCategoryPage(this.uiState.categoryIdx - 1).subscribe();

        }

    }

    prevQuestion(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        if (this.uiState.questionIdx > 0) {

            this.navigateToQuestionPage(this.uiState.questionIdx - 1).subscribe();

        }

    }

    nextCategory(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.uiState.nextCategoryIsPressed = true;

        if (!this.isLastCategory) {
            this.navigateToQuestionPage(0).pipe(
                switchMap(() => this.navigateToCategoryPage(this.uiState.categoryIdx + 1))
            ).subscribe();
        }

    }

    nextQuestion(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.uiState.nextQuestionIsPressed = true;

        if (!this.isLastQuestion) {
            this.navigateToQuestionPage(this.uiState.questionIdx + 1).subscribe();
        }

    }

    resetQuestionPage(evt: Event, categoryControl: AbstractControl): void {

        evt.preventDefault();

        if (this.uiState.questionIdx + 1 !== categoryControl.get('questionPage').value) {

            categoryControl.get('questionPage')
                .setValue(this.uiState.questionIdx + 1, {emitEvent: false, onlySelf: true});

        }

    }

    back(evt: Event): void {

        evt.preventDefault();

        if (sessionStorage.getItem('cmsfeedbackSearchUrl')) {

            this.router.navigateByUrl(sessionStorage.getItem('cmsfeedbackSearchUrl')).then();

        } else {

            this.router.navigate(['/feedback/search']).then();

        }

    }

    closeModal(evt: Event): void {

        evt.preventDefault();

        this.uiState.cancelModalIsOpen = false;

    }

    delete(): void {

        this.feedbackSvc
            .delete(this.feedbackForm.get('feedbackId').value)
            .subscribe(
                success => {

                    this.responseOnAction = success;
                    this.uiState.deleteSuccessModalIsOpen = true;

                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    this.uiState.deleteFailedModalIsOpen = true;
                }
            );

    }

}
