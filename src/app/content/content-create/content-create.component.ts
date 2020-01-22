import {FeedbackService} from '../../feedback/_service/feedback.service';
import * as $ from 'jquery';
import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ApiResourceService} from '../../_service/api-resource.service';
import {AuthService} from '../../auth/_service/auth.service';
import {Content, ContentFormOptions, ContentLookups, ContentReceiverSummary, ContentResources} from '../_model/content.model';
import {ContentService} from '../_service/content.service';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {MAT_DATE_FORMATS} from '@angular/material';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {distinctUntilChanged, finalize, switchMap, map, first} from 'rxjs/operators';
import {ActionResponse, ErrorResponse, HTMLInputEvent} from '../../_model/app.model';
import {combineLatest, of} from 'rxjs';
import {FemaValidator} from '../../_validators/fema.validators';
import {API_CONTENT_POST_UNIQUE_TITLE} from '../../_const/api.const';
import {HcmsService} from '../../_service/hcms.service';

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
    selector: 'fema-cms-content-create',
    templateUrl: './content-create.component.html',
    styleUrls: ['./content-create.component.scss'],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                display: {
                    dateInput: 'DD-MMM-YYYY',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class ContentCreateComponent implements AfterViewChecked, OnDestroy, OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    contentForm: FormGroup;

    contentLookup: ContentLookups;
    formOptions: ContentFormOptions;
    resourcesPath: ContentResources;

    contentReceiverSummary: ContentReceiverSummary;
    failedReceiverUrl: string;

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    uiState: {
        cancelModalIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        isSaving: boolean;
        processIsPressed: boolean;
        publishDateIsOpen: boolean;
        receiverIsProcessing: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        templateIsDownloading: boolean;
    };

    ngForTracker: Function = (idx: number): number => idx;

    get newsDtoForm(): FormGroup {
        return <FormGroup>this.contentForm.get('newsDto');
    }

    get popupDtoForm(): FormGroup {
        return <FormGroup>this.contentForm.get('popupDto');
    }

    get bannerDtoForm(): FormGroup {
        return <FormGroup>this.contentForm.get('bannerDto');
    }

    get disableNews(): boolean {
        return this.bannerDtoForm.getRawValue().selected || this.popupDtoForm.getRawValue().selected;
    }

    get disableBannerOrPopup(): boolean {
        return this.newsDtoForm.getRawValue().selected;
    }

    get enableUploadReceiver(): boolean {
        return this.contentForm.get('contentReceiverType').value === 'PRIVATE';
    }

    get showInvalidAlert(): boolean {
        return this.uiState.saveIsPressed && this.contentForm.invalid;
    }

    get enableProcess(): boolean {
        return this.contentForm.get('receiverFile').value;
    }

    set setBannerControl(bannerForm: FormGroup) {
        this.contentForm.setControl('bannerDto', bannerForm);
    }

    set setNewsControl(newsForm: FormGroup) {
        this.contentForm.setControl('newsDto', newsForm);
    }

    set setPopupControl(popupForm: FormGroup) {
        this.contentForm.setControl('popupDto', popupForm);
    }

    private enableControls(controlOptions: Array<any[]>): void {

        for (const [controlName, validators] of controlOptions) {

            this.contentForm.get(controlName).enable();
            this.contentForm.get(controlName).setValidators(validators);
            this.contentForm.get(controlName).updateValueAndValidity({onlySelf: true});

        }

    }

    private disableControls(controlNames: string[]): void {

        for (const controlName of controlNames) {

            this.contentForm.get(controlName).disable();
            this.contentForm.get(controlName).clearValidators();
            this.contentForm.get(controlName).updateValueAndValidity({onlySelf: true});

        }

    }

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private lookupSvc: LookupService,
        private resourceSvc: ApiResourceService,
        private contentSvc: ContentService,
        private validators: FemaValidator,
        private hcmsSvc: HcmsService,
        private feedbackSvc: FeedbackService
    ) {

        this.contentForm = formBuilder.group({
            bannerDto: formBuilder.group({}),
            contentReceiverType: [STANDARD_STRING_SELECTION[0].value, Validators.required],
            id: null,
            newsDto: formBuilder.group({}),
            popupDto: formBuilder.group({}),
            publishDate: {value: '', disabled: true},
            receiverFile: null,
            title: ['', Validators.required, validators.unique(API_CONTENT_POST_UNIQUE_TITLE, 'id')],
            uploadId: null,
            viaEmail: false,
            viaPushNotification: false
        });

        this.uiState = {
            cancelModalIsOpen: false,
            failedRecordIsDownloading: false,
            isSaving: false,
            processIsPressed: false,
            publishDateIsOpen: false,
            receiverIsProcessing: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            templateIsDownloading: false
        };

    }

    ngOnInit() {

        this.initContentSetup();

        this.contentForm.get('viaPushNotification').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(notification => {

                if (notification) {

                    this.enableControls([['publishDate', Validators.required]]);

                } else {

                    this.disableControls(['publishDate']);

                }

            });

        this.contentForm.get('contentReceiverType').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(contentReceiverType => {

                switch (contentReceiverType) {

                    case 'PUBLIC':

                        this.disableControls(['uploadId', 'receiverFile']);

                        break;

                    case 'PRIVATE':

                        this.enableControls([
                            ['uploadId', Validators.required],
                            ['receiverFile', [
                                Validators.required,
                                this.validators.fileTypes(['application/vnd.ms-excel'])
                            ]]
                        ]);

                        break;

                }

            });

    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        URL.revokeObjectURL(this.failedReceiverUrl);
    }

    initContentSetup(): void {

        combineLatest(
            this.contentSvc.getLookups(),
            this.contentSvc.getFormOptions(),
            this.contentSvc.getResources(),
        )
            .subscribe(
                initComps => [this.contentLookup, this.formOptions, this.resourcesPath] = initComps,
                error => this.errorOnInit = error
            );

    }

    getTargetTemplate(evt: Event): void {

        evt.preventDefault();

        this.uiState.templateIsDownloading = true;

        this.hcmsSvc.getUploadTemplate()
            .pipe(
                finalize(() => this.uiState.templateIsDownloading = false)
            )
            .subscribe(
                templateUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-CONTENT-RECEIVER-TEMPLATE-(${new Date().getTime()}).xls`;
                    aEle.href = templateUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                },

                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                });

    }

    selectFile(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.contentForm.get('receiverFile').patchValue(evt.target.files.item(0));

    }

    processFile(evt: Event): void {

        evt.preventDefault();

        this.uiState.processIsPressed = true;

        if (this.enableProcess) {

            this.uiState.receiverIsProcessing = true;

            this.contentSvc
                .postReceiverFile(this.contentForm.get('receiverFile').value, this.contentForm.get('uploadId').value)
                .pipe(
                    finalize(() => this.uiState = {
                        ...this.uiState,
                        receiverIsProcessing: false,
                        processIsPressed: false
                    })
                )
                .subscribe(
                    contentReceiverSummary => {
                        this.contentReceiverSummary = contentReceiverSummary;
                        this.contentForm.get('uploadId').patchValue(contentReceiverSummary.uploadId);
                    },
                    error => {
                        this.responseOnAction = {...error, type: 'ErrorResponse'};
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                );

        }

    }

    getFailedReceiver(evt: Event): void {

        evt.preventDefault();

        this.uiState.failedRecordIsDownloading = true;

        this.contentSvc.getFailedReceiver(this.contentForm.get('uploadId').value)
            .pipe(
                finalize(() => this.uiState.failedRecordIsDownloading = false)
            )
            .subscribe(
                templateUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.download = `FEMA-EVENT-PARTICIPANT-FAILED-RECORD-(${this.contentForm.get('uploadId').value}).xls`;
                    aEle.href = templateUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                },

                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.contentForm.get(control);

        const buttonIsPressed: boolean = this.uiState.saveIsPressed || this.uiState.processIsPressed;

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && buttonIsPressed : false;

        }

        return ctrl.invalid && buttonIsPressed;

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        const noContentSetupSelected: boolean =
            !this.newsDtoForm.get('selected').value
            && !this.bannerDtoForm.get('selected').value
            && !this.popupDtoForm.get('selected').value;

        if (!this.invalidField(this.contentForm) && !noContentSetupSelected) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

        } else if (noContentSetupSelected) {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                type: 'ErrorResponse',
                message: 'Please select at least one content setup'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                type: 'ErrorResponse',
                message: 'Please check marked field(s)'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        }

    }

    private saveNews(content: Content): void {

        this.resourceSvc.upload(
            this.resourcesPath.news.folder,
            new File(
                [new Blob([content.newsDto['content']], {type: 'text/html'})],
                'news.html'
            )
        )
            .pipe(
                map(htmlPath => {

                    const contentDto: Content = {
                        ...content,
                        newsDto: {
                            ...content.newsDto,
                            contentPath: htmlPath
                        }
                    };

                    delete contentDto['newsDto']['content'];

                    return contentDto;

                }),
                switchMap(contentDto => this.contentSvc.saveContent(contentDto)),
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

    private saveBanner(content: Content): void {

        this.resourceSvc.upload(this.resourcesPath.news.folder, content.bannerDto['imgFile'])
            .pipe(
                map(imgLocation => {

                    const contentDto: Content = {
                        ...content,
                        bannerDto: {...content.bannerDto, imgLocation}
                    };

                    delete contentDto['bannerDto']['imgFile'];

                    return contentDto;

                }),
                switchMap(contentDto => this.contentSvc.saveContent(contentDto)),
                switchMap(contentDto => {

                    const bannerMenuIsFeedback: boolean = contentDto.bannerDto
                        && contentDto.bannerDto.idLinkedMenu
                        && contentDto.bannerDto.idLinkedMenu === 'CON_LINK_MENU~FEEDBACK';

                    if (bannerMenuIsFeedback) {

                        return this.feedbackSvc.saveEventMapping({
                            feedbackId: contentDto.bannerDto.refId,
                            itemEndDate: contentDto.bannerDto.periodEnd,
                            itemId: contentDto.bannerDto.id,
                            itemName: contentDto.title,
                            itemStartDate: contentDto.bannerDto.periodStart,
                            itemType: 'CONTENT'
                        });

                    }

                    return of(null).pipe(first());

                }),
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

    private savePopup(content: Content): void {

        this.resourceSvc.upload(this.resourcesPath.news.folder, content.popupDto['imgFile'])
            .pipe(
                map(imgLocation => {

                    const contentDto: Content = {
                        ...content,
                        popupDto: {...content.popupDto, imgLocation}
                    };

                    delete contentDto['popupDto']['imgFile'];

                    return contentDto;

                }),
                switchMap(contentDto => this.contentSvc.saveContent(contentDto)),
                switchMap(contentDto => {

                    const popupMenuIsFeedback: boolean = contentDto.popupDto
                        && contentDto.popupDto.idLinkedMenu
                        && contentDto.popupDto.idLinkedMenu === 'CON_LINK_MENU~FEEDBACK';

                    if (popupMenuIsFeedback) {

                        return this.feedbackSvc.saveEventMapping({
                            feedbackId: contentDto.popupDto.refId,
                            itemEndDate: contentDto.popupDto.periodEnd,
                            itemId: contentDto.popupDto.id,
                            itemName: contentDto.title,
                            itemStartDate: contentDto.popupDto.periodStart,
                            itemType: 'CONTENT'
                        });

                    }

                    return of(null).pipe(first());

                }),
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

    private saveBannerPopup(content: Content): void {

        combineLatest(
            this.resourceSvc.upload(this.resourcesPath.news.folder, content.bannerDto['imgFile']),
            this.resourceSvc.upload(this.resourcesPath.news.folder, content.popupDto['imgFile'])
        )
            .pipe(
                map(([bannerImgLocation, popupImgLocation]) => {

                    const contentDto: Content = {
                        ...content,
                        bannerDto: {...content.bannerDto, imgLocation: bannerImgLocation},
                        popupDto: {...content.popupDto, imgLocation: popupImgLocation}
                    };

                    delete contentDto['bannerDto']['imgFile'];
                    delete contentDto['popupDto']['imgFile'];

                    return contentDto;

                }),
                switchMap(contentDto => this.contentSvc.saveContent(contentDto)),
                switchMap(contentDto => {

                    const bannerMenuIsFeedback: boolean = contentDto.bannerDto
                        && contentDto.bannerDto.idLinkedMenu
                        && contentDto.bannerDto.idLinkedMenu === 'CON_LINK_MENU~FEEDBACK';

                    const popupMenuIsFeedback: boolean = contentDto.popupDto
                        && contentDto.popupDto.idLinkedMenu
                        && contentDto.popupDto.idLinkedMenu === 'CON_LINK_MENU~FEEDBACK';

                    if (bannerMenuIsFeedback && !popupMenuIsFeedback) {

                        return this.feedbackSvc.saveEventMapping({
                            feedbackId: contentDto.bannerDto.refId,
                            itemEndDate: contentDto.bannerDto.periodEnd,
                            itemId: contentDto.bannerDto.id,
                            itemName: contentDto.title,
                            itemStartDate: contentDto.bannerDto.periodStart,
                            itemType: 'CONTENT'
                        });

                    } else if (!bannerMenuIsFeedback && popupMenuIsFeedback) {

                        return this.feedbackSvc.saveEventMapping({
                            feedbackId: contentDto.popupDto.refId,
                            itemEndDate: contentDto.popupDto.periodEnd,
                            itemId: contentDto.popupDto.id,
                            itemName: contentDto.title,
                            itemStartDate: contentDto.popupDto.periodStart,
                            itemType: 'CONTENT'
                        });

                    } else if (bannerMenuIsFeedback && popupMenuIsFeedback) {

                        return combineLatest(
                            this.feedbackSvc.saveEventMapping({
                                feedbackId: contentDto.bannerDto.refId,
                                itemEndDate: contentDto.bannerDto.periodEnd,
                                itemId: contentDto.bannerDto.id,
                                itemName: contentDto.title,
                                itemStartDate: contentDto.bannerDto.periodStart,
                                itemType: 'CONTENT'
                            }),
                            this.feedbackSvc.saveEventMapping({
                                feedbackId: contentDto.popupDto.refId,
                                itemEndDate: contentDto.popupDto.periodEnd,
                                itemId: contentDto.popupDto.id,
                                itemName: contentDto.title,
                                itemStartDate: contentDto.popupDto.periodStart,
                                itemType: 'CONTENT'
                            })
                        );

                    }

                    return of(null).pipe(first());

                }),
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

    save(): void {

        this.uiState.isSaving = true;

        const {bannerDto, newsDto, popupDto, ...contentFormValue} = this.contentForm.getRawValue();

        const contentSave: Content = {
            ...contentFormValue,
            title: contentFormValue.title.trim(),
            bannerDto: bannerDto.selected ? {
                ...bannerDto,
                periodEnd: bannerDto.periodEnd.valueOf(),
                periodStart: bannerDto.periodStart.valueOf(),
            } : null,
            newsDto: newsDto.selected ? newsDto : null,
            popupDto: popupDto.selected ? {
                ...popupDto,
                periodEnd: popupDto.periodEnd.valueOf(),
                periodStart: popupDto.periodStart.valueOf(),
            } : null,
            publishDate: contentFormValue.viaPushNotification ? contentFormValue.publishDate : new Date()
        };

        delete contentSave['receiverFile'];

        if (contentSave.newsDto && !contentSave.bannerDto && !contentSave.popupDto) {

            delete contentSave['newsDto']['selected'];

            this.saveNews(contentSave);

        } else if (!contentSave.newsDto && contentSave.bannerDto && !contentSave.popupDto) {

            delete contentSave['bannerDto']['selected'];

            this.saveBanner(contentSave);

        } else if (!contentSave.newsDto && !contentSave.bannerDto && contentSave.popupDto) {

            delete contentSave['popupDto']['selected'];

            this.savePopup(contentSave);

        } else if (!contentSave.newsDto && contentSave.bannerDto && contentSave.popupDto) {

            delete contentSave['bannerDto']['selected'];
            delete contentSave['popupDto']['selected'];

            this.saveBannerPopup(contentSave);

        }

    }

}
