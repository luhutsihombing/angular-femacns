import {LookupService} from '../../lookup/_service/lookup.service';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, from, Observable, of, Subject} from 'rxjs';
import {distinctUntilChanged, filter, finalize, first, switchMap} from 'rxjs/operators';
import {FeedbackService} from '../_service/feedback.service';
import {ActionResponse, ErrorResponse, FemaOption, HTMLInputEvent} from '../../_model/app.model';
import * as $ from 'jquery';
import {FemaValidator} from '../../_validators/fema.validators';
import {ApiResourceService} from '../../_service/api-resource.service';
import {ResourcePath} from '../../content/_model/api-resource.model';
import {API_FEEDBACK_POST_UNIQUE_TITLE} from '../../_const/api.const';
import {FeedbackValidator} from '../_validator/feedback.validator';
import {FemaService} from '../../_service/fema.service';

@Component({
    selector: 'fema-cms-feedback-create',
    templateUrl: './feedback-create.component.html',
    styleUrls: ['./feedback-create.component.scss'],
})
export class FeedbackCreateComponent implements AfterViewChecked, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;

    formOptions: {
        answerTypes: Array<FemaOption>;
        questionCategories: Array<FemaOption>;
        resourcePath: ResourcePath
    };

    feedbackForm: FormGroup;
    lookup: {
        maxImageSize: number;
        maxQuestionLength: number;
        maxDescLength: number;
    };
    pageChangeEventSubject: Subject<void>;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        goToPageFieldInvalid: boolean;
        cancelModalIsOpen: boolean;
        categoryIdx: number;
        deleteCategoryModalIsOpen: boolean;
        deleteCategorySuccessModalIsOpen: boolean;
        deleteQuestionModalIsOpen: boolean;
        deleteQuestionSuccessModalIsOpen: boolean;
        isSaving: boolean;
        questionIdx: number;
        nextCategoryIsPressed: boolean;
        nextQuestionIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        saveIsPressed: boolean;
    };

    readonly ngForTracker: Function = (idx: number, qTime: number): number => qTime;

    readonly selectImage = (evt: HTMLInputEvent, questionControl: AbstractControl): void => {

        evt.preventDefault();
        questionControl.get('imageFile').patchValue(evt.target.files.item(0));

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

        const categoryForm: FormGroup = this.fb.group({
            questionCategory: ['', Validators.required],
            questionPage: ['1'],
            questions: this.fb.array([this.createQuestion()]),
        });

        categoryForm.get('questionPage').valueChanges.subscribe(questionPage =>
            this.uiState.goToPageFieldInvalid = !new RegExp(/^([0-9])+$/).exec(questionPage)
        );

        return categoryForm;

    }

    private createQuestion(): FormGroup {

        const questionForm: FormGroup = this.fb.group({
            allowFillIn: false,
            choices: this.fb.array([]),
            dateFormat: '',
            defaultValue: '',
            image: '',
            imageFile: [null, [
                this.validators.fileTypes(['image/jpeg', 'image/png']),
                this.validators.maxFileSize(this.lookup.maxImageSize)
            ]],
            maxNumCharacters: ['', Validators.pattern(/^([0-9])+$/)],
            numOfRange: '',
            numOfLinesEditing: '',
            question: ['', Validators.required],
            questionId: '',
            ratingScale: '',
            required: [false, Validators.required],
            typeOfAnswerValue: ['', Validators.required],
        });

        questionForm.get('typeOfAnswerValue').valueChanges.subscribe(detailCode => {

            [
                'allowFillIn',
                'choices',
                'dateFormat',
                'defaultValue',
                'image',
                'numOfRange',
                'numOfLinesEditing',
                'ratingScale',
                'maxNumCharacters',
            ].forEach(ctrlName => {
                questionForm.get(ctrlName).clearValidators();
                questionForm.get(ctrlName).updateValueAndValidity({emitEvent: false});
            });

            const choicesForm = (<FormArray>questionForm.get('choices'));
            choicesForm.controls.forEach(control => {

                control.clearValidators();
                control.updateValueAndValidity({emitEvent: false});

            });

            switch (detailCode) {

                case 'MULTIPLE_CHOICE':

                    questionForm.get('allowFillIn').setValidators([Validators.required, this.feedbackValidator.minChoices()]);
                    questionForm.get('allowFillIn').updateValueAndValidity({emitEvent: false, onlySelf: true});

                    questionForm.get('choices').setValidators(Validators.required);
                    questionForm.get('choices').updateValueAndValidity({emitEvent: false, onlySelf: true});

                    if (!choicesForm.controls || (choicesForm.controls && choicesForm.controls.length === 0)) {
                        choicesForm.push(this.createChoice());
                    }

                    break;

                case 'SINGLE_LINE_OF_TEXT':

                    questionForm.get('maxNumCharacters').setValidators([Validators.required, Validators.min(1),
                        Validators.pattern(/^([0-9])+$/)]);
                    questionForm.get('maxNumCharacters').updateValueAndValidity({emitEvent: false});

                    break;

            }

        });

        questionForm.get('imageFile').valueChanges
            .pipe(
                filter(imageFile => imageFile && (imageFile.type === 'image/jpeg' || imageFile.type === 'image/png')),
                switchMap(imageFile => this.resourceSvc.upload(this.formOptions.resourcePath.folder, imageFile))
            )
            .subscribe(imageUrl => questionForm.get('image').patchValue(imageUrl));

        questionForm.get('allowFillIn').valueChanges
            .subscribe(() => questionForm.updateValueAndValidity({emitEvent: false}));

        return questionForm;

    }

    private showAllErrors(): void {

        const errors = this.femaSvc.getAllNestedErrors(this.feedbackForm);

        const errorLabels: string[] = [];

        if (errors && errors.categories) {

            for (const [catIdx, cat] of Object.entries(errors.categories)) {

                errorLabels.push(`Category ${+catIdx + 1}`);

                if (cat && cat['questions']) {

                    for (const queIdx of Object.keys(cat['questions'])) {

                        errorLabels.push(`Category ${+catIdx + 1} Question ${+queIdx + 1}`);

                    }

                }

            }

        }

        this.responseOnAction = {
            ...{} as ErrorResponse,
            type: 'ErrorResponse',
            message: `Please check: ${Array.from(new Set([...errorLabels])).join('; ')}`
        };

        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

    }

    constructor(
        private ar: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private router: Router,
        private resourceSvc: ApiResourceService,
        private feedbackSvc: FeedbackService,
        private feedbackValidator: FeedbackValidator,
        private femaSvc: FemaService,
        private validators: FemaValidator,
        private lookupService: LookupService,
    ) {

        this.pageChangeEventSubject = new Subject<void>();

        this.feedbackForm = fb.group({
            categories: fb.array([]),
            description: '',
            feedbackId: null,
            needCalculation: [false, Validators.required],
            templateName: ['', Validators.required, validators.uniqueFeedback(API_FEEDBACK_POST_UNIQUE_TITLE)],
        });

        this.lookup = {
            maxImageSize: 0,
            maxQuestionLength: 1000,
            maxDescLength: 300
        };

        this.uiState = {
            goToPageFieldInvalid: false,
            cancelModalIsOpen: false,
            categoryIdx: 0,
            deleteCategoryModalIsOpen: false,
            deleteCategorySuccessModalIsOpen: false,
            deleteQuestionModalIsOpen: false,
            deleteQuestionSuccessModalIsOpen: false,
            isSaving: false,
            questionIdx: 0,
            nextCategoryIsPressed: false,
            nextQuestionIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            saveIsPressed: false
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.ar.queryParams
            .pipe(
                filter(qParams =>
                    !qParams.hasOwnProperty('categorySeq') || !qParams.hasOwnProperty('questionSeq')
                )
            )
            .subscribe(() => {

                this.uiState = {
                    ...this.uiState,
                    categoryIdx: 0,
                    questionIdx: 0
                };

                this.router
                    .navigate(['/feedback/create'], {queryParams: {categorySeq: 1, questionSeq: 1}})
                    .then();

            });

        this.ar.queryParams
            .pipe(
                filter(qParams => qParams.categorySeq && qParams.questionSeq),
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            )
            .subscribe(qParams => {

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

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    initialSetup(): void {

        combineLatest(
            this.feedbackSvc.getQuestionCategories(),
            this.feedbackSvc.getAnswerTypes(),
            this.resourceSvc.getPath('FEEDBACK'),
            this.lookupService.getNumericDetailMeaning('FEEDBACK_MIN_MAX_CHARACTER~DESCRIPTION_FIELD'),
            this.lookupService.getNumericDetailMeaning('FEEDBACK_MIN_MAX_CHARACTER~TEMPLATE_NAME_FIELD'),
            this.lookupService.getNumericDetailMeaning('FEEDBACK_MIN_MAX_CHARACTER~MAX_SIZE_IMAGE')
        ).subscribe(
            ([questionCategories, answerTypes, resourcePath, descriptionField, templateNameField, maxImageSize]) => {

                this.formOptions = {questionCategories, answerTypes, resourcePath};
                this.feedbackForm.get('description').setValidators(Validators.maxLength(descriptionField));
                this.feedbackForm.get('templateName').setValidators([Validators.required, Validators.maxLength(templateNameField)]);

                this.feedbackForm.updateValueAndValidity({emitEvent: false, onlySelf: true});

                this.lookup.maxImageSize = maxImageSize;
                this.lookup.maxDescLength = descriptionField;

                this.categoriesForm.push(this.createCategory());

            },
            error => {

                this.errorOnInit = {...error, type: 'ErrorResponse'};
                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

            }
        );

    }

    changeQuestionPage(evt: KeyboardEvent): void {

        evt.preventDefault();
        this.pageChangeEventSubject.next();

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.feedbackForm.get(control);

        const buttonIsPressed: boolean = this.uiState.saveIsPressed
            || this.uiState.nextCategoryIsPressed
            || this.uiState.nextQuestionIsPressed;

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] && buttonIsPressed : false;

        }

        return ctrl.invalid && buttonIsPressed;

    }


    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.feedbackForm.get(control);

        if (errorType) {
            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;
        }

        return null;

    }

    isActiveCategory(idx: number): boolean {
        return this.uiState.categoryIdx === idx;
    }

    isActiveQuestion(idx: number): boolean {
        return this.uiState.questionIdx === idx;
    }

    navigateToCategoryPage(idx: number): Observable<boolean> {

        return from(this.router.navigate(
            ['/feedback/create'],
            {
                queryParams: {categorySeq: idx + 1},
                queryParamsHandling: 'merge',

            }
        )).pipe(finalize(() => this.uiState.nextCategoryIsPressed = false));

    }

    navigateToQuestionPage(idx: number): Observable<boolean> {

        return from(
            this.router.navigate(
                ['/feedback/create'],
                {
                    queryParams: {questionSeq: idx + 1},
                    queryParamsHandling: 'merge',
                }
            )
        )
            .pipe(
                finalize(() => {

                    this.uiState.nextQuestionIsPressed = false;

                    const questionPageControl: AbstractControl = this.feedbackForm
                        .get(['categories', this.uiState.categoryIdx, 'questionPage']);

                    if (questionPageControl) {

                        questionPageControl.patchValue(this.uiState.questionIdx + 1);

                    }

                })
            );

    }

    prevCategory(evt: Event): void {

        evt.preventDefault();

        if (this.uiState.categoryIdx > 0) {

            this.navigateToCategoryPage(this.uiState.categoryIdx - 1).pipe(
                switchMap(() => {

                    if (this.categoriesForm.get([this.uiState.categoryIdx, 'questions', this.uiState.questionIdx])) {

                        return this.navigateToQuestionPage(this.uiState.questionIdx);

                    }

                    return this.navigateToQuestionPage(0);

                })
            ).subscribe();

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

        if (this.isLastCategory) {

            if (this.feedbackForm.valid) {

                this.uiState.nextCategoryIsPressed = false;

                of(this.categoriesForm).pipe(
                    first(),
                    switchMap(() => this.navigateToQuestionPage(0)),
                    switchMap(() => this.navigateToCategoryPage(this.uiState.categoryIdx + 1))
                ).subscribe();

                this.categoriesForm.push(this.createCategory());

            } else {

                this.showAllErrors();

            }

        } else {

            this.navigateToCategoryPage(this.uiState.categoryIdx + 1).pipe(
                switchMap(() => {

                    if (this.categoriesForm.get([this.uiState.categoryIdx, 'questions', this.uiState.questionIdx])) {

                        return this.navigateToQuestionPage(this.uiState.questionIdx);

                    }

                    return this.navigateToQuestionPage(0);

                })
            ).subscribe();

        }

    }

    nextQuestion(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.uiState.nextQuestionIsPressed = true;

        if (this.isLastQuestion) {

            if (this.feedbackForm.valid) {

                this.uiState.nextQuestionIsPressed = false;

                of(this.questionsForm)
                    .pipe(
                        first(),
                        switchMap(() => this.navigateToQuestionPage(this.uiState.questionIdx + 1))
                    )
                    .subscribe();

                this.questionsForm.push(this.createQuestion());

            } else {

                this.showAllErrors();

            }

        } else {

            this.navigateToQuestionPage(this.uiState.questionIdx + 1).subscribe();

        }

    }

    deleteCategory(): void {

        if (this.uiState.categoryIdx > 0) {

            of(
                (<FormArray>this.feedbackForm.get('categories')).removeAt(this.uiState.categoryIdx)
            ).pipe(
                switchMap(() => this.navigateToCategoryPage(this.uiState.categoryIdx - 1)),
            ).subscribe();

        } 
        else if (this.uiState.categoryIdx === 0 && !this.isLastCategory) {

            of(
                (<FormArray>this.feedbackForm.get('categories')).removeAt(this.uiState.categoryIdx)
            ).pipe(
                switchMap(() => this.navigateToCategoryPage(this.uiState.categoryIdx)),
            ).subscribe();

        }

    }

    deleteQuestion(): void {

        if (this.uiState.questionIdx > 0) {

            of(
                (<FormArray>this.feedbackForm.get(['categories', this.uiState.categoryIdx, 'questions']))
                    .removeAt(this.uiState.questionIdx)
            )
                .pipe(
                    switchMap(() => this.navigateToQuestionPage(this.uiState.questionIdx - 1)),
                    // switchMap(() => this.navigateToCategoryPage(this.uiState.categoryIdx - 1)),
                )
                .subscribe();

        } else if (this.uiState.questionIdx === 0 && !this.isLastQuestion) {

            of(
                (<FormArray>this.feedbackForm.get(['categories', this.uiState.categoryIdx, 'questions']))
                    .removeAt(this.uiState.questionIdx)
            )
                .pipe(
                    switchMap(() => this.navigateToQuestionPage(this.uiState.questionIdx)),
                )
                .subscribe();

        }

    }

    resetQuestionPage(evt: Event, categoryControl: AbstractControl): void {

        evt.preventDefault();

        if (this.uiState.questionIdx + 1 !== categoryControl.get('questionPage').value) {

            categoryControl.get('questionPage')
                .setValue(this.uiState.questionIdx + 1, {emitEvent: false, onlySelf: true});

        }

    }

    // Multiple Choice methods

    createChoice(): FormControl {

        return this.fb.control('', [
            Validators.required,
            this.feedbackValidator.minChoices()
        ]);

    }

    addChoice(evt: Event, question: FormGroup): void {

        evt.preventDefault();

        (<FormArray>question.get('choices')).push(this.createChoice());
        question.get('allowFillIn').updateValueAndValidity({emitEvent: false});

    }

    deleteChoice(evt: Event, question: FormGroup, choiceIdx: number): void {

        evt.preventDefault();

        (<FormArray>question.get('choices')).removeAt(choiceIdx);
        question.get('allowFillIn').updateValueAndValidity({emitEvent: false});

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        if (this.feedbackForm.valid) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

        } else {

            this.showAllErrors();

        }

    }

    save(): void {

        const feedback = this.feedbackForm.getRawValue();

        for (const category of feedback.categories) {

            delete category.questionPage;

            for (const question of category.questions) {

                delete question.imageFile;

            }

        }

        delete feedback.feedbackId;

        this.uiState.isSaving = true;

        this.feedbackSvc
            .save({...feedback, templateName: feedback.templateName})
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
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

}
