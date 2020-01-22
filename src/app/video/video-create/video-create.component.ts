import * as $ from 'jquery';
import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CONTENT_RECEIVERS} from '../../content/_const/content.const';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpEventType, HttpProgressEvent, HttpResponse} from '@angular/common/http';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {VideoService} from '../_service/video.service';
import {LookupService} from '../../lookup/_service/lookup.service';
import {WistiaVideoResponse} from '../_model/video.model';
import {debounceTime, finalize} from 'rxjs/operators';
import {Subscription, fromEvent} from 'rxjs';
import {WISTIA_EMBED_PLAYER} from '../../_const/wistia.const';

@Component({
    selector: 'fema-cms-video-create',
    templateUrl: './video-create.component.html',
    styleUrls: ['./video-create.component.scss']
})
export class VideoCreateComponent implements OnInit, AfterViewChecked {
    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    @ViewChild('domVideo') domVideo: ElementRef;

    categories: Array<{ value: string; label: string }>;

    createForm: FormGroup;

    private videoUpload: Subscription;

    uploadProgress: HttpProgressEvent;
    videoResolution: {
        width: string;
        height: string;
    };

    uploadPercentage: number;
    autocompMinChar: number;

    responseOnAction: any;
    errorOnAction: any;
    uploadValidationMessage: any;
    tubeMaxSizeVideo: any;
    feedbackSuggestion: any;

    saveSuccessModalOpened: boolean;
    videoIsValid: boolean;
    cancelUpload: boolean;
    videoIsDropped: boolean;
    saveIsPressed: boolean;
    cancelModalOpened: boolean;
    saveModalOpened: boolean;
    isSaving: boolean;
    responseInvalid: any;
    invalid: boolean;
    title: string;
    videoIsUnique: boolean;
    feedbackId: string;

    constructor(
        fb: FormBuilder,
        private lookupSvc: LookupService,
        private videoService: VideoService,
    ) {
        this.categories = STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS);

        this.createForm = fb.group({
            category: ['', Validators.required],
            descriptionVideo: ['', [Validators.required, Validators.maxLength(300)]],
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

        this.uploadPercentage = 0;
        this.videoIsValid = true;
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
        this.lookupSvc
            .getLookupDetailMeaning('FIFTUBE_GLOBAL_SETTING~TUBE_MAX_SIZE_VIDEO')
            .subscribe(tubeMaxSizeVideo => (this.tubeMaxSizeVideo = tubeMaxSizeVideo));

        this.createForm.get('title').valueChanges.subscribe(() => this.videoIsUnique = false);

        this.lookupSvc
            .getLookupDetailMeaning('GLOBAL_SETUP~MIN_CHAR')
            .subscribe(val => (this.autocompMinChar = <number>val));

        this.videoService.getFeedbackSuggestion()
            .subscribe(feedback => this.feedbackSuggestion = feedback.dataList);
    }

    uploadVideo(evt: DragEvent): void {
        evt.preventDefault();

        this.title = evt.dataTransfer.files.item(0).name;

        const fileType: string = evt.dataTransfer.files.item(0) ? evt.dataTransfer.files.item(0).type.split('/')[0] : '';
        const fileSizeIsValid: boolean =
            evt.dataTransfer.files.item(0) && evt.dataTransfer.files.item(0).size <= this.tubeMaxSizeVideo * 1048576;

        if (fileType === 'video' && fileSizeIsValid) {
            this.videoIsValid = true;
            this.videoIsDropped = true;

            this.videoUpload = this.videoService
                .postWistiaVideo(evt.dataTransfer.files.item(0))
                .subscribe(
                    result => {

                        if (result.type === HttpEventType.UploadProgress) {

                            this.uploadProgress = result;
                            this.uploadPercentage = Math.round(100 * result.loaded / result.total);

                        } else if (result instanceof HttpResponse) {

                            const wistiaVideo: WistiaVideoResponse = result.body;

                            this.createForm.patchValue({
                                ...wistiaVideo,
                                id: null,
                                thumbnailUrl: wistiaVideo.thumbnail.url,
                                uploadDate: wistiaVideo.created,
                                url: `${WISTIA_EMBED_PLAYER}/${wistiaVideo.hashed_id}`
                            });

                        }

                    },
                    error => {

                        this.errorOnAction = error;
                        this.uploadPercentage = 0;
                        this.videoIsDropped = false;

                    }
                );

        } else if (fileType !== 'video') {
            this.uploadValidationMessage = 'Not a valid video format';
            this.videoIsValid = false;
        } else if (!fileSizeIsValid) {
            this.uploadValidationMessage = 'Maximum size allowed is ' + this.tubeMaxSizeVideo + ' MB';
            this.videoIsValid = false;
        }
    }

    private openCancelUpload(): void {
        this.cancelUpload = true;
    }

    cancelUploadModal(evt: Event): void {
        evt.preventDefault();
        this.cancelUpload = false;
        this.videoIsDropped = true;
    }

    abortVideoUpload(evt: Event): void {
        evt.preventDefault();
        this.openCancelUpload();
    }

    abort(evt: Event): void {
        evt.preventDefault();
        this.cancelUpload = false;
        this.videoUpload.unsubscribe();
        this.uploadPercentage = 0;
        this.videoIsDropped = false;
    }

    videoIsNotUploaded(): boolean {
        return !this.createForm.getRawValue().url && this.uploadPercentage === 0;
    }

    videoIsUploading(): boolean {
        return !this.createForm.getRawValue().url && this.uploadPercentage > 0 && this.uploadPercentage <= 100;
    }

    videoIsUploaded(): boolean {
        return this.createForm.getRawValue().url && this.uploadPercentage >= 100;
    }

    invalidField(controlName: string | string[]): boolean {
        if (this.createForm.get(controlName).errors) {
            return (
                (this.createForm.get(controlName).errors.required && this.saveIsPressed) ||
                this.createForm.get(controlName).errors.maxlength
            );
        }

        return this.createForm.get(controlName).invalid && this.saveIsPressed;
    }

    checkFormValidity(evt: Event): void {
        evt.preventDefault();
        this.saveIsPressed = true;

        this.videoService
            .postValidateUniqueVideo({
                id: this.createForm.getRawValue().id,
                title: this.createForm.getRawValue().title
            })
            .subscribe(resp => {
                this.videoIsUnique = resp.isFound;

                if (this.videoIsUploading() && this.createForm.get('url').invalid) {
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    this.invalid = true;
                    this.responseInvalid = 'Video cannot be save. Please wait until the progress bar is 100%.';
                } else if (this.showInvalidAlert() || this.videoIsUnique) {
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                } else {
                    this.invalid = false;
                    this.openSaveModal();
                }
            });
    }

    showInvalidAlert(): boolean {
        return this.saveIsPressed && this.createForm.invalid;
    }

    openCancelModal(evt: Event): void {
        evt.preventDefault();
        this.cancelModalOpened = true;
    }

    private openSaveModal(): void {
        this.saveModalOpened = true;
    }

    checkFeeback(evt: Event, controlName: string) {
        evt.preventDefault();


        const feedbackSuggestion = this.feedbackSuggestion
            ? this.feedbackSuggestion.find(feed => feed.templateName === this.createForm.get(controlName).value)
            : undefined;

        if (!feedbackSuggestion) {
            this.createForm.get(controlName).reset();
        }

        this.feedbackSuggestion.map(f => {
            f.templateName === this.createForm.get(controlName).value
                ? this.feedbackId = f.id
                : undefined;
        });
    }


    save(content: any): void {

        this.videoService
            .postSaveVideo({...content, title: content.title.trim(), description: content.descriptionVideo})
            .pipe(
                finalize(() => {
                    this.isSaving = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                })
            )
            .subscribe(
                success => {

                    if (this.createForm.getRawValue().feedback !== '') {
                        const feedbackTerm = {
                            feedbackId: this.feedbackId,
                            itemId: success.toString(),
                            itemName: this.createForm.getRawValue().title,
                            itemType: 'FIFTUBE'
                        };

                        this.videoService.postFeedbackSave(feedbackTerm).subscribe(
                            resp => {
                                this.responseOnAction = success;
                                this.saveSuccessModalOpened = true;
                            });
                    } else {
                        this.responseOnAction = success;
                        this.saveSuccessModalOpened = true;
                    }


                },
                error => this.errorOnAction = error
            );

    }
}
