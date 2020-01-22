import * as $ from 'jquery';
import {ActivatedRoute} from '@angular/router';
import {ApiResourceService} from '../../_service/api-resource.service';
import {ChannelService} from '../_service/channel.service';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CONTENT_RECEIVERS} from '../../content/_const/content.const';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActionResponse, ErrorResponse, HTMLInputEvent} from '../../_model/app.model';
import {LookupService} from '../../lookup/_service/lookup.service';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {VideoService} from '../../video/_service/video.service';
import {VideoSuggestion} from '../../video/_model/video.model';
import {debounceTime, distinctUntilChanged, filter, finalize, map, switchMap} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {ChannelSave, ChannelViewerSummary} from '../_model/channel.model';
import {HcmsService} from '../../_service/hcms.service';
import {FemaValidator} from '../../_validators/fema.validators';
import {API_CHANNEL_POST_UNIQUE_TITLE} from '../../_const/api.const';

/*
* ==================
* DEVELOPMENT NOTICE
* ==================
*
* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
* > NO NEED to add UI state for validation
* > All validations MUST go to FormGroup/FormArray/FormControl,
*   create a custom one if necessary
* > UI state ONLY for loading indication/human interaction
* > UI state based on data (periodHasPassed, etc.) use RETURN from GET method,
*   or access directly from variable/form/etc.
* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/

@Component({
    selector: 'fema-cms-channel-edit',
    templateUrl: './channel-edit.component.html',
    styleUrls: ['./channel-edit.component.scss']
})
export class ChannelEditComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    viewers: Array<{ value: string; label: string }>;
    channelForm: FormGroup;

    lookup: {
        minChar: number;
    };

    viewerSummary: ChannelViewerSummary;

    videoSuggestions: VideoSuggestion[];

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        cancelModalIsOpen: boolean;
        deleteModalIsOpen: boolean;
        deleteSuccessModalIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        imageIsValid: boolean;
        processIsPressed: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        successModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        templateIsDownloading: boolean;
        viewerIsProcessing: boolean;
    };

    get enableProcess(): boolean {
        return this.channelForm.get('viewerFile').valid;
    }

    get fiftubesForm(): FormArray {
        return <FormArray>this.channelForm.get('fiftubes');
    }

    get showInvalidAlert(): boolean {
        return this.uiState.saveIsPressed && this.channelForm.invalid;
    }

    get enableUploadViewer(): boolean {
        return this.channelForm.get('viewer').value === 'PRIVATE';
    }

    private enableControls(controlOptions: Array<any[]>): void {

        for (const [controlName, validators] of controlOptions) {

            this.channelForm.get(controlName).enable();
            this.channelForm.get(controlName).setValidators(validators);
            this.channelForm.get(controlName).updateValueAndValidity({onlySelf: true});

        }

    }

    private disableControls(controlNames: string[]): void {

        for (const controlName of controlNames) {

            this.channelForm.get(controlName).disable();
            this.channelForm.get(controlName).clearValidators();
            this.channelForm.get(controlName).updateValueAndValidity({onlySelf: true});

        }

    }

    private createFiftubeForm(): FormGroup {

        const fiftubeForm: FormGroup = this.fb.group({
            selected: false,
            id: ['', Validators.required],
            thumbnailUrl: ['', Validators.required],
            title: ['', Validators.required],
            url: ['', Validators.required]
        });

        fiftubeForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(title => title && title.length > 0 && title.length >= this.lookup.minChar),
                filter(title => this.videoSuggestions.findIndex(suggestion => suggestion.title === title) === -1),
                switchMap(title => this.videoSvc.getVideoSuggestion(title)),
                filter(videoSuggestions => videoSuggestions && videoSuggestions.length > 0),
            )
            .subscribe(videoSuggestions => this.videoSuggestions = videoSuggestions);

        fiftubeForm.get('selected').valueChanges.subscribe(() => {
            const allSelected: boolean = this.fiftubesForm
                .getRawValue()
                .map(form => form.selected)
                .reduce((prevVal, currVal) => prevVal && currVal);

            this.channelForm.get('selectAllFiftubes').patchValue(allSelected, {emitEvent: false});
        });

        return fiftubeForm;

    }

    constructor(
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private resourceSvc: ApiResourceService,
        private channelSvc: ChannelService,
        private hcmsSvc: HcmsService,
        private lookupSvc: LookupService,
        private validators: FemaValidator,
        private videoSvc: VideoService,
    ) {

        this.viewers = STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS);

        this.channelForm = fb.group({
            channel: ['', Validators.required, validators.unique(API_CHANNEL_POST_UNIQUE_TITLE, 'id')],
            description: '',
            fiftubes: fb.array([]),
            iconChannelPath: '',
            iconFile: null,
            id: null,
            selectAllFiftubes: false,
            uploadId: null,
            viewer: ['', Validators.required],
            viewerFile: null,
        });

        this.viewerSummary = {} as ChannelViewerSummary;

        this.videoSuggestions = [];

        this.lookup = {
            minChar: 2,
        };

        this.uiState = {
            cancelModalIsOpen: false,
            deleteModalIsOpen: false,
            deleteSuccessModalIsOpen: false,
            failedRecordIsDownloading: false,
            imageIsValid: true,
            processIsPressed: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            successModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            templateIsDownloading: false,
            viewerIsProcessing: false
        };

    }

    ngOnInit() {

        this.initialSetup();

        this.channelForm.get('channel').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(channel => channel && channel.length > 0),
                map(channel => channel.trim()),
            )
            .subscribe(channel => this.channelForm.get('channel').setValue(channel, {emitEvent: false}));

        this.channelForm.get('selectAllFiftubes').valueChanges.subscribe(selectAll =>
            this.fiftubesForm.controls.forEach(fiftubeForm => fiftubeForm.get('selected').patchValue(selectAll))
        );

    }

    initialSetup(): void {

        this.activatedRoute.params
            .pipe(
                switchMap(({id}) => combineLatest(
                    this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
                    this.lookupSvc.getLookupDetailMeaning('FIFTUBE_GLOBAL_SETTING~TUBE_ICON_SIZE'),
                    this.channelSvc.getChannel(id),
                    this.channelSvc.getExistingMember(id)
                ))
            )
            .subscribe(
                ([minChar, maxIconSize, channel, channelMemberSummaryItems]) => {

                    this.lookup = {minChar};

                    this.channelForm.get('iconFile').setValidators([
                        this.validators.fileTypes(['image/png', 'image/jpeg']),
                        this.validators.maxFileSize(maxIconSize)
                    ]);

                    this.channelForm.get('iconFile').updateValueAndValidity({emitEvent: false, onlySelf: true});

                    this.channelForm.patchValue(channel);

                    for (const [idx, fiftube] of Object.entries(channel.fiftubes)) {
                        this.addVideo();
                        this.fiftubesForm.get(idx.toString()).patchValue(fiftube);
                    }

                    this.viewerSummary.successItems = channelMemberSummaryItems;

                    this.channelForm.get('viewer').valueChanges
                        .pipe(distinctUntilChanged())
                        .subscribe(viewer => {

                            switch (viewer) {

                                case 'PUBLIC':

                                    this.disableControls(['uploadId', 'viewerFile']);

                                    break;

                                case 'PRIVATE':
                                    const noSuccessItem: boolean =
                                        !this.viewerSummary
                                        || !this.viewerSummary.successItems
                                        || (
                                            this.viewerSummary
                                            && this.viewerSummary.successItems
                                            && this.viewerSummary.successItems.length === 0
                                        );

                                    if (noSuccessItem) {
                                        this.enableControls([
                                            ['uploadId', Validators.required],
                                            ['viewerFile', [
                                                Validators.required,
                                                this.validators.fileTypes(['application/vnd.ms-excel'])
                                            ]]
                                        ]);
                                    }

                                    break;

                            }

                        });

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );
    }

    addVideo(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.fiftubesForm.push(this.createFiftubeForm());

    }

    videoSuggestionsDatalist(control: AbstractControl): string {
        return control.get('title').value && (control.get('title').value.length >= this.lookup.minChar) ? 'videoSuggestions' : '';
    }

    checkTitle(evt: Event, control: AbstractControl, controlIdx: number) {

        evt.preventDefault();

        const suggestion: VideoSuggestion = this.videoSuggestions.find(video => video.title === control.value);

        if (suggestion) {

            const fiftubesForm = this.fb.array(this.fiftubesForm.getRawValue());

            fiftubesForm.removeAt(controlIdx);

            const currentVideoIsDuplicate: boolean = fiftubesForm
                .getRawValue()
                .findIndex(video => video.title === control.value) > -1;

            if (currentVideoIsDuplicate) {

                control.reset();

            } else {

                (<AbstractControl>control.parent).patchValue({
                    id: suggestion.id,
                    title: suggestion.title,
                    url: suggestion.url,
                    thumbnailUrl: suggestion.thumbPath,
                });

            }

        } else {

            control.reset();

        }

    }

    disableRemoveVideo(): boolean {

        return !this.fiftubesForm.getRawValue().find(fiftube => (fiftube && fiftube.selected) === true);

    }

    removeVideo(evt: Event): void {

        evt.preventDefault();

        this.fiftubesForm
            .getRawValue()
            .map((form, idx) => (form.selected ? idx : -1))
            .filter(idx => idx > -1)
            .reverse()
            .forEach(idx => this.fiftubesForm.removeAt(idx));

        this.channelForm.get('selectAllFiftubes').patchValue(false, {emitEvent: false});

    }

    selectIcon(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.channelForm.get('iconFile').patchValue(evt.target.files.item(0));

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.channelForm.get(control);

        const buttonIsPressed: boolean = this.uiState.saveIsPressed || this.uiState.processIsPressed;

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] && buttonIsPressed : false;

        }

        return ctrl.invalid && buttonIsPressed;

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.channelForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        if (!this.invalidField(this.channelForm)) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

        } else {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        }

    }

    getTargetTemplate(evt: Event): void {

        evt.preventDefault();

        this.uiState.templateIsDownloading = true;

        this.hcmsSvc.getUploadTemplate()
            .pipe(
                finalize(() => this.uiState.templateIsDownloading = false)
            )
            .subscribe(templateUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.style = 'display: none';
                aEle.download = `FEMA-CHANNEL-RECEIVER-TEMPLATE-(${new Date().getTime()}).xls`;
                aEle.href = templateUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }

    selectFile(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.channelForm.get('viewerFile').patchValue(evt.target.files.item(0));

    }

    processFile(evt: Event): void {

        evt.preventDefault();

        this.uiState.processIsPressed = true;

        if (this.channelForm.getRawValue().viewerFile !== null) {

            this.uiState.viewerIsProcessing = true;

            this.channelSvc
                .postReceiverFile(this.channelForm.get('viewerFile').value, this.channelForm.get('uploadId').value)
                .pipe(
                    finalize(() => this.uiState = {
                        ...this.uiState,
                        viewerIsProcessing: false,
                        processIsPressed: false
                    })
                )
                .subscribe(
                    viewerSummary => {
                        this.viewerSummary = viewerSummary;
                        this.channelForm.get('uploadId').patchValue(viewerSummary.uploadId);
                    },
                    error => {
                        this.responseOnAction = {...error, type: 'ErrorResponse'};
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                );

        }

    }

    getFailedRecord(evt: Event): void {

        evt.preventDefault();

        this.uiState.failedRecordIsDownloading = true;

        this.channelSvc.getFailedReceiver(this.channelForm.get('uploadId').value)
            .pipe(
                finalize(() => this.uiState.failedRecordIsDownloading = false)
            )
            .subscribe(templateUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.style = 'display: none';
                aEle.download = `FEMA-CHANNEL-VIEWER-FAILED-RECORD-(${this.channelForm.get('uploadId').value}).xls`;
                aEle.href = templateUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }

    openCancelModal(evt: Event): void {
        evt.preventDefault();
        this.uiState.cancelModalIsOpen = true;
    }

    openDeleteModal(evt: Event): void {

        evt.preventDefault();
        this.uiState.deleteModalIsOpen = true;

    }

    save(): void {

        const channelSave: ChannelSave = {
            ...this.channelForm.getRawValue(),
            fiftubes: this.channelForm.get('fiftubes').value.map(({selected, ...others}) => others),
            channel: this.channelForm.getRawValue().channel.trim()
        };

        delete channelSave['iconFile'];
        delete channelSave['selectAllFiftubes'];

        const saveObs: Observable<any> = this.channelForm.get('iconFile').value
            ? this.channelSvc.getChannelResourcePath()
                .pipe(
                    switchMap(resourcePath =>
                        this.resourceSvc.upload(resourcePath.folder, this.channelForm.get('iconFile').value)
                    ),
                    switchMap(downloadPath => this.channelSvc.postChannelSave({
                        ...this.channelForm.getRawValue(),
                        iconChannelPath: downloadPath
                    }))
                )
            : this.channelSvc.postChannelSave(channelSave);

        saveObs
            .pipe(
                finalize(() => {

                    this.uiState.saveIsPressed = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                })
            )
            .subscribe(
                success => {
                    this.responseOnAction = {...success, type: 'GenericResponse'};
                    this.uiState.successModalIsOpen = true;
                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

    delete(): void {

        this.channelSvc
            .deleteVideo(this.channelForm.getRawValue().id)
            .pipe(
                finalize(() => {

                    this.uiState.saveIsPressed = false;
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
