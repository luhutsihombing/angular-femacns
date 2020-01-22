import {LookupService} from '../../lookup/_service/lookup.service';
import * as $ from 'jquery';
import {ActivatedRoute} from '@angular/router';
import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CONTENT_RECEIVERS} from '../../content/_const/content.const';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {VideoService} from '../_service/video.service';
import {debounceTime, filter, finalize, first, map, switchMap} from 'rxjs/operators';
import {combineLatest, fromEvent, of} from 'rxjs';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';
import {Observable} from 'rxjs/internal/Observable';
import {Video} from '../_model/video.model';

@Component({
    selector: 'fema-cms-video-edit',
    templateUrl: './video-edit.component.html',
    styleUrls: ['./video-edit.component.scss']
})
export class VideoEditComponent implements OnInit, AfterViewChecked {

    categories: Array<{ value: string; label: string }>;
    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    @ViewChild('domVideo') domVideo: ElementRef;
    videoForm: FormGroup;

    videoResolution: {
        width: string;
        height: string;
    };

    lookup: {
        minChar: number;
    };
    suggestion: {
        feedbacks: Array<{ id: string; templateName: string }>;
    };

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        cancelModalIsOpen: boolean;
        deleteModalIsOpen: boolean;
        deleteSuccessModalIsOpen: boolean;
        prevFeedbackIsExist: boolean;
        isDeleting: boolean;
        isSaving: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        saveIsPressed: boolean;
        videoIsLoaded: boolean;
    };

    invalid: boolean;
    videoIsUnique: boolean;

    get feedbackDatalist(): string {
        return this.videoForm.get('feedback').value.length >= this.lookup.minChar ? 'feedbackSuggestion' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        formBuilder: FormBuilder,
        private videoSvc: VideoService,
        private lookupSvc: LookupService,
    ) {

        this.categories = STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS);

        this.videoForm = formBuilder.group({
            category: ['', Validators.required],
            description: ['', [Validators.required, Validators.maxLength(300)]],
            duration: '',
            feedback: ['', Validators.maxLength(150)],
            id: null,
            showOnHome: true,
            thumbnailUrl: '',
            title: ['', [Validators.required, Validators.maxLength(250)]],
            uploadDate: '',
            url: ['', Validators.required],
            viewable: true
        });

        this.uiState = {
            cancelModalIsOpen: false,
            deleteModalIsOpen: false,
            deleteSuccessModalIsOpen: false,
            prevFeedbackIsExist: false,
            isDeleting: false,
            isSaving: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            saveIsPressed: false,
            videoIsLoaded: false
        };

    }

    ngAfterViewChecked() {

        if (this.domVideo && this.domVideo.nativeElement) {

            setTimeout(() => {

                const calculateVideoResolution: Function = () =>
                    (this.videoResolution = {
                        width: `${this.domVideo.nativeElement.offsetWidth} px`,
                        height: `${this.domVideo.nativeElement.offsetWidth * 0.5625} px`
                    });

                calculateVideoResolution();

                fromEvent(window, 'resize')
                    .pipe(debounceTime(500))
                    .subscribe(() => calculateVideoResolution());
            }, 100);

        }

    }

    ngOnInit() {

        this.initialSetup();

        this.videoForm.get('title').valueChanges.subscribe(() => this.videoIsUnique = false);

    }

    initialSetup(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        combineLatest(
            this.ar.params,
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.videoSvc.getFeedbackSuggestion()
        )
            .pipe(
                filter(([params]) => params.hasOwnProperty('id')),
                map(([params, minChar, feedbacks]) =>
                    ({id: params.id, minChar, feedbacks: feedbacks.dataList})
                ),
                switchMap(({id, minChar, feedbacks}) => {

                    this.lookup = {minChar};
                    this.suggestion = {feedbacks};

                    return combineLatest(
                        this.videoSvc.getVideo(id),
                        this.videoSvc.getFeedbackName(id)
                    );

                }),
            )
            .subscribe(
                ([video, {data}]) => {

                    this.uiState.prevFeedbackIsExist = !!data;

                    this.videoForm.patchValue({
                        ...video,
                        uploadDate: video.uploadDate ? video.uploadDate : new Date().toISOString(),
                        feedback: data ? data : ''
                    });

                },
                error => this.errorOnInit = error
            );

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.videoForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        this.videoSvc
            .postValidateUniqueVideo({
                id: this.videoForm.getRawValue().id,
                title: this.videoForm.getRawValue().title
            })
            .subscribe(resp => {

                this.videoIsUnique = resp.isFound;

                if (this.videoIsUnique) {

                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                } else {

                    this.uiState.saveModalIsOpen = true;

                }
            });
    }

    checkFeedback(evt: Event) {

        evt.preventDefault();

        const feedbackIsExist: boolean = this.suggestion.feedbacks
            .findIndex(feedback => feedback.templateName === this.videoForm.get('feedback').value) > -1;

        if (!feedbackIsExist) {
            this.videoForm.get('feedback').reset();
        }

    }

    save(): void {

        this.uiState.isSaving = true;

        let saveObs: Observable<Video> = this.videoSvc.postSaveVideo({
            ...this.videoForm.getRawValue(),
            title: this.videoForm.get('title').value.trim()
        });

        const selectedFeedback = this.suggestion.feedbacks
            .find(feedback => feedback.templateName === this.videoForm.get('feedback').value);

        if (selectedFeedback) {

            saveObs = saveObs.pipe(
                switchMap(() => this.videoSvc.postFeedbackSave({
                    feedbackId: selectedFeedback.id,
                    itemId: this.videoForm.get('id').value,
                    itemName: this.videoForm.get('title').value,
                    itemType: 'FIFTUBE'
                }))
            );

        }

        saveObs.pipe(
            finalize(() => {

                this.uiState.isSaving = false;
                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

            })
        )
            .subscribe(
                () => this.uiState.saveSuccessModalIsOpen = true,
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

    delete(): void {

        if (this.videoForm.get('showOnHome').value || this.videoForm.get('viewable').value) {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'This video cannot be deleted. You must switch off Viewable and Show on FIFTUBE Home',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else {

            this.uiState.isDeleting = true;

            this.videoSvc.deleteVideo(this.videoForm.get('id').value)
                .pipe(
                    switchMap(() =>
                        this.uiState.prevFeedbackIsExist
                            ? this.videoSvc.deleteFeedbackTemplate(this.videoForm.get('id').value)
                            : of(null).pipe(first())
                    ),
                    finalize(() => {

                        this.uiState.isDeleting = false;
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                    })
                )
                .subscribe(
                    success => {
                        this.responseOnAction = {...success, type: 'GenericResponse'};
                        this.uiState.deleteSuccessModalIsOpen = true;
                    },
                    error => this.responseOnAction = {...error, type: 'ErrorResponse'}
                );

        }

    }

}
