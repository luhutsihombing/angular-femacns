import * as $ from 'jquery';
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
import {ChannelViewerSummary} from '../_model/channel.model';
import {HcmsService} from '../../_service/hcms.service';
import {combineLatest} from 'rxjs';
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
    selector: 'fema-cms-channel-create',
    templateUrl: './channel-create.component.html',
    styleUrls: ['./channel-create.component.scss']
})
export class ChannelCreateComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    channelForm: FormGroup;
    viewers: Array<{ value: string; label: string }>;

    lookup: {
        minChar: number;
    };

    videoSuggestions: VideoSuggestion[];

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    viewerSummary: ChannelViewerSummary;

    uiState: {
        cancelModalIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        imageIsValid: boolean;
        processIsPressed: boolean;
        viewerIsProcessing: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        successModalIsOpen: boolean;
        templateIsDownloading: boolean;
    };

    ngForTracker = (idx: number): number => idx;

    get disableRemoveVideo(): boolean {
        return !this.fiftubesForm.getRawValue().find(fiftube => (fiftube && fiftube.selected) === true);
    }

    get fiftubesForm(): FormArray {
        return <FormArray>this.channelForm.get('fiftubes');
    }

    get showInvalidAlert(): boolean {
        return this.uiState.saveIsPressed && this.channelForm.invalid;
    }

    get enableProcess(): boolean {
        return this.channelForm.get('viewerFile').valid;
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
                //     map(videoSuggestions => {
                //
                //         const duplicateResults: Function = (inputArray: string[]): string[] => {
                //
                //             const newInputArray = inputArray.slice().sort();
                //             const duplicateEntries: string[] = [];
                //
                //             for (let i = 0; i < newInputArray.length - 1; i++) {
                //                 if (newInputArray[i + 1] === newInputArray[i]) {
                //                     duplicateEntries.push(newInputArray[i]);
                //                 }
                //             }
                //
                //             return duplicateEntries;
                //
                //         };
                //
                //         const titles: string[] = this.fiftubesForm.getRawValue().map(video => video.title);
                //
                //         console.log(titles);
                //         console.log(duplicateResults(titles));
                //
                //         duplicateResults(titles).forEach(title => {
                //
                //             const duplicateIdx: number = videoSuggestions.findIndex(suggestion => suggestion.title === title);
                //
                //             videoSuggestions.splice(duplicateIdx, 1);
                //
                //         });
                //
                //         return videoSuggestions;
                //
                //     })
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
        private fb: FormBuilder,
        private lookupSvc: LookupService,
        private resourceSvc: ApiResourceService,
        private videoSvc: VideoService,
        private channelSvc: ChannelService,
        private hcmsSvc: HcmsService,
        private validators: FemaValidator,
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
            viewerFile: null
        });

        this.videoSuggestions = [] as VideoSuggestion[];

        this.lookup = {
            minChar: 2,
        };

        this.uiState = {
            cancelModalIsOpen: false,
            failedRecordIsDownloading: false,
            imageIsValid: true,
            processIsPressed: false,
            viewerIsProcessing: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            successModalIsOpen: false,
            templateIsDownloading: false,
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
            this.fiftubesForm.controls.forEach(control => control.get('selected').patchValue(selectAll))
        );

        this.channelForm.get('viewer').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(viewer => {

                switch (viewer) {

                    case 'PUBLIC':

                        this.disableControls(['uploadId', 'viewerFile']);

                        break;

                    case 'PRIVATE':

                        this.enableControls([
                            ['uploadId', Validators.required],
                            ['viewerFile', [
                                Validators.required,
                                this.validators.fileTypes(['application/vnd.ms-excel'])
                            ]]
                        ]);

                        break;

                }

            });

        this.addVideo();

    }

    initialSetup(): void {

        combineLatest(
            this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
            this.lookupSvc.getLookupDetailMeaning('FIFTUBE_GLOBAL_SETTING~TUBE_ICON_SIZE')
        )
            .subscribe(
                ([minChar, maxIconSize]) => {

                    this.lookup = {minChar};

                    this.channelForm.get('iconFile').setValidators([
                        Validators.required,
                        this.validators.fileTypes(['image/png', 'image/jpeg']),
                        this.validators.maxFileSize(maxIconSize)
                    ]);

                    this.channelForm.get('iconFile').updateValueAndValidity({emitEvent: false, onlySelf: true});

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

    downloadReceiverTemplate(evt: Event): void {

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

        if (this.enableProcess) {

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

    save(): void {

        this.channelSvc
            .getChannelResourcePath()
            .pipe(
                switchMap(resourcePath =>
                    this.resourceSvc.upload(resourcePath.folder, this.channelForm.get('iconFile').value)
                ),
                switchMap(downloadPath => {

                    const channelSave = {
                        ...this.channelForm.getRawValue(),
                        iconChannelPath: downloadPath,
                        channel: this.channelForm.getRawValue().channel.trim()
                    };

                    delete channelSave.iconFile;
                    delete channelSave.viewerFile;

                    return this.channelSvc.postChannelSave(channelSave);

                }),
                finalize(() => {
                    this.uiState.saveIsPressed = false;
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                })
            )
            .subscribe(
                success => {
                    this.responseOnAction = success;
                    this.uiState.successModalIsOpen = true;
                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

}
