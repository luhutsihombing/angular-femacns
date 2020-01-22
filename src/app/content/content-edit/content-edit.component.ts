import {ActionResponse, ErrorResponse, GenericResponse, HTMLInputEvent} from '../../_model/app.model';
import * as $ from 'jquery';
import JSSoup from 'jssoup';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ApiResourceService} from '../../_service/api-resource.service';
import {AuthService} from '../../auth/_service/auth.service';
import {Content, ContentLookups, ContentReceiverSummary, ContentFormOptions} from '../_model/content.model';
import {ContentService} from '../_service/content.service';
import {AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MAT_DATE_FORMATS} from '@angular/material';
import {ResourcePath} from '../_model/api-resource.model';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {debounceTime, distinctUntilChanged, filter, finalize, first, map, skipUntil, switchMap, tap} from 'rxjs/operators';
import {Observable, combineLatest, of, Subject} from 'rxjs';
import {API_CONTENT_POST_UNIQUE_TITLE} from '../../_const/api.const';
import {FemaValidator} from '../../_validators/fema.validators';
import {HcmsService} from '../../_service/hcms.service';
import {EventService} from '../../event/_service/event.service';
import {EventSuggestion} from '../../event/_model/event.model';
import {FeedbackTemplateSuggestion} from '../../feedback/_model/feedback.model';
import {FeedbackService} from '../../feedback/_service/feedback.service';
import {VideoService} from '../../video/_service/video.service';
import * as moment from 'moment';
import {FemaService} from '../../_service/fema.service';

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

interface ControlOption {
    controlName: string[] | string;
    validator: ValidatorFn[] | AsyncValidatorFn[] | ValidatorFn | AsyncValidatorFn;
}

@Component({
    selector: 'fema-cms-content-edit',
    templateUrl: './content-edit.component.html',
    styleUrls: ['./content-edit.component.scss'],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {dateInput: 'LL'},
                display: {
                    dateInput: 'DD-MMM-YYYY',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        },
        FemaService
    ]
})
export class ContentEditComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDate: Date;
    contentForm: FormGroup;
    defaultBannerSubject: Subject<Event>;

    contentLookup: ContentLookups;
    formOptions: ContentFormOptions;
    resourcesPath: {
        news: ResourcePath;
        banner: ResourcePath;
        popup: ResourcePath;
    };

    content: Content;
    receiverSummary: ContentReceiverSummary;
    newsHtmlContent: string;
    newsImageUrls: string[];

    errorOnInit: ErrorResponse;
    responseOnAction: ActionResponse;

    suggestions: {
        bannerEvents: Array<EventSuggestion>;
        bannerTitles: any[];
        feedbacks: Array<FeedbackTemplateSuggestion>;
        popupEvents: Array<EventSuggestion>;
        popupTitles: any[];
    };

    uiState: {
        bannerDefaultModalIsOpen: boolean;
        bannerPeriodEndIsOpen: boolean;
        bannerPeriodStartIsOpen: boolean;
        cancelModalIsOpen: boolean;
        deleteModalIsOpen: boolean;
        deleteSuccessModalIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        isDeleting: boolean;
        isSaving: boolean;
        processIsPressed: boolean;
        popupPeriodEndIsOpen: boolean;
        popupPeriodStartIsOpen: boolean;
        publishDateIsOpen: boolean;
        receiverIsProcessing: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        selectedFileIsValid: boolean;
        templateIsDownloading: boolean;
    };

    readonly ngForTracker: Function = (idx: number): number => idx;

    get bannerForm(): FormGroup {
        return <FormGroup>this.contentForm.get('bannerDto');
    }

    get bannerTitleDatalist(): string {
        return this.bannerForm.get('title').value && this.bannerForm.get('title').value.length >= this.contentLookup.minChar ? 'bannerTitleSelection' : '';
    }

    get newsForm(): FormGroup {
        return <FormGroup>this.contentForm.get('newsDto');
    }

    get bannerPeriodStartHasPassed(): boolean {
        return this.bannerForm.get('periodStart').value ? this.bannerForm.get('periodStart').value <= moment() : false;
    }

    get bannerPeriodEndHasPassed(): boolean {
        return this.bannerForm.get('periodEnd').value ? this.bannerForm.get('periodEnd').value <= moment() : false;
    }

    get popupPeriodStartHasPassed(): boolean {
        return this.popupForm.get('periodStart').value ? this.popupForm.get('periodStart').value <= moment() : false;
    }

    get popupPeriodEndHasPassed(): boolean {
        return this.popupForm.get('periodEnd').value ? this.popupForm.get('periodEnd').value <= moment() : false;
    }

    get popupForm(): FormGroup {
        return <FormGroup>this.contentForm.get('popupDto');
    }

    get popupTitleDatalist(): string {
        return this.popupForm.get('title').value && this.popupForm.get('title').value.length >= this.contentLookup.minChar ? 'popUpTitleSelection' : '';
    }

    constructor(
        private ar: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private contentSvc: ContentService,
        private eventSvc: EventService,
        private femaSvc: FemaService,
        private feedbackSvc: FeedbackService,
        private hcmsSvc: HcmsService,
        private resourceSvc: ApiResourceService,
        private videoSvc: VideoService,
        private validators: FemaValidator
    ) {

        this.currentDate = new Date();

        this.contentForm = formBuilder.group({
            bannerDto: formBuilder.group({
                selected: [false, Validators.required],
                active: [{value: true, disabled: true}],
                defaultBanner: [{value: false, disabled: true}],
                description: {value: '', disabled: true},
                id: '',
                idLinkedMenu: {value: '', disabled: true},
                imgFile: null,
                imgLocation: '',
                periodEnd: {value: '', disabled: true},
                periodStart: {value: '', disabled: true},
                refId: '',
                title: {value: '', disabled: true}
            }),
            contentReceiverType: [STANDARD_STRING_SELECTION[0].value, Validators.required],
            id: null,
            newsDto: formBuilder.group({
                selected: [false, Validators.required],
                content: '',
                contentPath: '',
                id: null,
                idNewsCategory: {value: '', disabled: true},
                thumbPath: ''
            }),
            popupDto: formBuilder.group({
                selected: [false, Validators.required],
                active: [{value: true, disabled: true}],
                description: {value: '', disabled: true},
                id: '',
                idLinkedMenu: {value: '', disabled: true},
                imgFile: null,
                imgLocation: '',
                periodEnd: {value: '', disabled: true},
                periodStart: {value: '', disabled: true},
                refId: '',
                title: {value: '', disabled: true}
            }),
            publishDate: {value: '', disabled: true},
            receiverFile: null,
            title: ['', Validators.required, validators.unique(API_CONTENT_POST_UNIQUE_TITLE, 'id')],
            uploadId: null,
            viaEmail: false,
            viaPushNotification: false
        });

        this.defaultBannerSubject = new Subject<Event>();

        this.contentLookup = {} as ContentLookups;
        this.formOptions = {} as ContentFormOptions;
        this.resourcesPath = {
            news: {} as ResourcePath,
            banner: {} as ResourcePath,
            popup: {} as ResourcePath,
        };

        this.receiverSummary = {} as ContentReceiverSummary;
        this.newsHtmlContent = '';
        this.newsImageUrls = [];

        this.suggestions = {
            bannerEvents: [],
            bannerTitles: [],
            feedbacks: [],
            popupEvents: [],
            popupTitles: []
        };

        this.uiState = {
            bannerDefaultModalIsOpen: false,
            bannerPeriodEndIsOpen: false,
            bannerPeriodStartIsOpen: false,
            cancelModalIsOpen: false,
            deleteModalIsOpen: false,
            deleteSuccessModalIsOpen: false,
            failedRecordIsDownloading: false,
            isDeleting: false,
            isSaving: false,
            processIsPressed: false,
            popupPeriodEndIsOpen: false,
            popupPeriodStartIsOpen: false,
            publishDateIsOpen: false,
            receiverIsProcessing: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            templateIsDownloading: false,
            selectedFileIsValid: true,
        };
    }

    private enableControls(controlOptions: Array<ControlOption>): void {

        for (const {controlName, validator} of controlOptions) {

            this.contentForm.get(controlName).enable();
            this.contentForm.get(controlName).setValidators(validator);
            // this.contentForm.get(controlName).patchValue('');
            this.contentForm.get(controlName).updateValueAndValidity({emitEvent: false, onlySelf: true});

        }

    }

    private disableControls(controlNames: Array<string[]> | string[]): void {

        for (const controlName of controlNames) {

            this.contentForm.get(controlName).disable();
            this.contentForm.get(controlName).clearValidators();
            this.contentForm.get(controlName).patchValue('');
            this.contentForm.get(controlName).updateValueAndValidity({emitEvent: false, onlySelf: true});

        }

    }

    ngOnInit() {

        this.initialSetup();

        this.contentForm.get('viaPushNotification').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(notification => {

                if (notification) {

                    this.enableControls([{controlName: 'publishDate', validator: Validators.required}]);

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

                        const noSuccessItem: boolean =
                            !this.receiverSummary
                            || !this.receiverSummary.successItems
                            || (
                                this.receiverSummary
                                && this.receiverSummary.successItems
                                && this.receiverSummary.successItems.length === 0
                            );

                        if (noSuccessItem) {

                            this.enableControls([
                                {controlName: 'uploadId', validator: Validators.required},
                                {
                                    controlName: 'receiverFile',
                                    validator: [
                                        Validators.required,
                                        this.validators.fileTypes(['application/vnd.ms-excel'])
                                    ]
                                },
                            ]);

                        }

                        break;

                }

            });

        this.newsForm.get('selected').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(selected => {

                if (selected) {

                    this.enableControls([
                        {controlName: ['newsDto', 'content'], validator: Validators.required},
                        {controlName: ['newsDto', 'idNewsCategory'], validator: Validators.required},
                        {controlName: ['newsDto', 'thumbPath'], validator: null},
                    ]);

                    this.bannerForm.get('selected').patchValue(false);
                    this.bannerForm.get('selected').disable();

                    this.popupForm.get('selected').patchValue(false);
                    this.popupForm.get('selected').disable();

                } else {

                    this.disableControls([
                        ['newsDto', 'content'],
                        ['newsDto', 'idNewsCategory'],
                        ['newsDto', 'thumbPath']
                    ]);

                    this.bannerForm.get('selected').enable();

                    this.popupForm.get('selected').enable();

                }

            });

        this.bannerForm.get('defaultBanner').valueChanges
            .pipe(
                skipUntil(this.defaultBannerSubject.asObservable()),
                distinctUntilChanged(),
                tap(defaultBanner => {

                    if (!defaultBanner) {
                        this.removeDefaultBanner();
                    }

                }),
                filter(defaultBanner => defaultBanner === true),
                switchMap(() => this.contentSvc.defaultBannerIsExist())
            )
            .subscribe(
                defaultBannerIsExist => {

                    if (defaultBannerIsExist) {

                        this.uiState.bannerDefaultModalIsOpen = true;

                    } else {

                        this.setAsDefaultBanner();

                    }

                },
                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

        this.bannerForm.get('idLinkedMenu').valueChanges
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(id => {

                switch (id) {

                    case 'CON_LINK_MENU~CULTURE':
                        this.disableControls([['bannerDto', 'title']]);

                        break;

                    case 'CON_LINK_MENU~TEAM_GRAND_PRIZE':
                        this.disableControls([['bannerDto', 'title']]);

                        break;


                    case 'CON_LINK_MENU~VIP_POINTS':
                        this.disableControls([['bannerDto', 'title']]);

                        break;

                    case '':
                        this.disableControls([['bannerDto', 'title']]);

                        break;

                    default:
                        this.enableControls([{controlName: ['bannerDto', 'title'], validator: Validators.required}]);

                        break;

                }


            });

        this.bannerForm.get('selected').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(selected => {

                if (selected) {

                    this.enableControls([
                        {controlName: ['bannerDto', 'active'], validator: Validators.required},
                        {controlName: ['bannerDto', 'defaultBanner'], validator: null},
                        {controlName: ['bannerDto', 'description'], validator: Validators.required},
                        {controlName: ['bannerDto', 'idLinkedMenu'], validator: null},
                        // {controlName: ['bannerDto', 'imgLocation'], validator: Validators.required},
                        {controlName: ['bannerDto', 'title'], validator: null},
                    ]);

                    if (!this.bannerForm.get('defaultBanner').value) {

                        if (!this.bannerPeriodStartHasPassed) {

                            this.enableControls([
                                {controlName: ['bannerDto', 'periodStart'], validator: Validators.required},
                            ]);

                        }

                        if (!this.bannerPeriodEndHasPassed) {

                            this.enableControls([
                                {controlName: ['bannerDto', 'periodEnd'], validator: Validators.required},
                            ]);

                        }

                    }

                    this.newsForm.get('selected').patchValue(false);
                    this.newsForm.get('selected').disable();

                } else {

                    this.disableControls([
                        ['bannerDto', 'active'],
                        ['bannerDto', 'defaultBanner'],
                        ['bannerDto', 'description'],
                        ['bannerDto', 'idLinkedMenu'],
                        // ['bannerDto', 'imgLocation'],
                        ['bannerDto', 'periodEnd'],
                        ['bannerDto', 'periodStart'],
                        ['bannerDto', 'title'],
                    ]);

                    this.newsForm.get('selected').enable();

                }

            });

        this.bannerForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(title => title && title.length > 0),
                switchMap(title => {

                    const titleInSuggestions = this.suggestions.bannerTitles
                        .find(sTitle => (sTitle.title === title) || sTitle['templateName'] === title);

                    if (titleInSuggestions) {

                        this.bannerForm.get('refId').patchValue(titleInSuggestions.id);

                    } else if (!titleInSuggestions) {

                        switch (this.bannerForm.get('idLinkedMenu').value) {

                            case 'CON_LINK_MENU~EVENT':
                                return this.eventSvc.getEventSuggestion(title);

                            case 'CON_LINK_MENU~FEEDBACK':
                                return titleInSuggestions ? of(null) : of(this.suggestions.feedbacks);

                            case 'CON_LINK_MENU~FIFTUBE':
                                return this.videoSvc.getVideoSuggestion(title);

                            case 'CON_LINK_MENU~NEWS_INFO':
                                return this.contentSvc.getContentSuggestion(title);

                        }

                    }

                })
            )
            .subscribe(titles => this.suggestions.bannerTitles = titles);

        this.popupForm.get('idLinkedMenu').valueChanges
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(id => {

                switch (id) {

                    case 'CON_LINK_MENU~CULTURE':
                        this.disableControls([['popupDto', 'title']]);

                        break;

                    case 'CON_LINK_MENU~TEAM_GRAND_PRIZE':
                        this.disableControls([['popupDto', 'title']]);

                        break;


                    case 'CON_LINK_MENU~VIP_POINTS':
                        this.disableControls([['popupDto', 'title']]);

                        break;

                    case '':
                        this.disableControls([['popupDto', 'title']]);

                        break;

                    default:
                        this.enableControls([{controlName: ['popupDto', 'title'], validator: Validators.required}]);

                        break;

                }

            });

        this.popupForm.get('selected').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(selected => {

                if (selected) {

                    this.enableControls([
                        {controlName: ['popupDto', 'active'], validator: Validators.required},
                        {controlName: ['popupDto', 'description'], validator: Validators.required},
                        {controlName: ['popupDto', 'idLinkedMenu'], validator: null},
                        // {controlName: ['popupDto', 'imgLocation'], validator: Validators.required},
                        {controlName: ['popupDto', 'title'], validator: null},
                    ]);

                    if (!this.popupPeriodStartHasPassed) {

                        this.enableControls([
                            {controlName: ['popupDto', 'periodStart'], validator: Validators.required},
                        ]);

                    }

                    if (!this.popupPeriodEndHasPassed) {

                        this.enableControls([
                            {controlName: ['popupDto', 'periodEnd'], validator: Validators.required},
                        ]);

                    }

                    this.newsForm.get('selected').patchValue(false);
                    this.newsForm.get('selected').disable();

                } else {

                    this.disableControls([
                        ['popupDto', 'active'],
                        ['popupDto', 'description'],
                        ['popupDto', 'idLinkedMenu'],
                        // ['popupDto', 'imgLocation'],
                        ['popupDto', 'periodEnd'],
                        ['popupDto', 'periodStart'],
                        ['popupDto', 'title'],
                    ]);

                    this.newsForm.get('selected').enable();

                }

            });

        this.popupForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(title => title && title.length > 0),
                switchMap(title => {

                    const titleInSuggestions = this.suggestions.popupTitles
                        .find(sTitle => (sTitle.title === title) || sTitle['templateName'] === title);

                    if (titleInSuggestions) {
                        this.popupForm.get('refId').patchValue(titleInSuggestions.id);
                    } else if (!titleInSuggestions) {

                        switch (this.popupForm.get('idLinkedMenu').value) {

                            case 'CON_LINK_MENU~EVENT':
                                return this.eventSvc.getEventSuggestion(title);

                            case 'CON_LINK_MENU~FEEDBACK':
                                return titleInSuggestions ? of(null) : of(this.suggestions.feedbacks);

                            case 'CON_LINK_MENU~FIFTUBE':
                                return this.videoSvc.getVideoSuggestion(title);

                            case 'CON_LINK_MENU~NEWS_INFO':
                                return this.contentSvc.getContentSuggestion(title);

                        }

                    }

                })
            )
            .subscribe(titles => this.suggestions.popupTitles = titles);

    }

    checkFormValidity(evt: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        const noContentSetupSelected: boolean =
            !this.newsForm.get('selected').value
            && !this.bannerForm.get('selected').value
            && !this.popupForm.get('selected').value;

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

    checkDeleteValidity(evt: Event) {

        evt.preventDefault();

        if (this.bannerForm.get('selected').value || this.popupForm.get('selected').value) {

            if (
                (this.bannerPeriodStartHasPassed && this.bannerPeriodEndHasPassed)
                || (this.popupPeriodStartHasPassed && this.popupPeriodStartHasPassed)
                || (!this.bannerPeriodStartHasPassed && !this.bannerPeriodEndHasPassed)
                || (!this.popupPeriodStartHasPassed && !this.popupPeriodStartHasPassed)
            ) {

                this.uiState.deleteModalIsOpen = true;

            } else {

                this.responseOnAction = {
                    ...{} as ErrorResponse,
                    type: 'ErrorResponse',
                    message: 'Content is still in active period'
                };

                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

            }

        } else {

            this.uiState.deleteModalIsOpen = true;

        }

    }

    delete(): void {

        this.uiState.isDeleting = true;

        let deleteContent: Observable<GenericResponse> = this.contentSvc.deleteContent(this.contentForm.get('id').value);

        if (this.popupForm.get('title').value !== '' && this.popupForm.get('idLinkedMenu').value === 'CON_LINK_MENU~FEEDBACK') {

            deleteContent = deleteContent.pipe(
                switchMap(() => this.feedbackSvc.deleteEventMapping(this.popupForm.get('id').value))
            );

        }

        if (this.bannerForm.get('title').value !== '' && this.bannerForm.get('idLinkedMenu').value === 'CON_LINK_MENU~FEEDBACK') {

            deleteContent = deleteContent.pipe(
                switchMap(() => this.feedbackSvc.deleteEventMapping(this.bannerForm.get('id').value))
            );

        }

        deleteContent
            .pipe(finalize(() => {

                this.uiState.isDeleting = false;
                $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

            }))
            .subscribe(
                success => {
                    this.responseOnAction = {...success, type: 'GenericResponse'};
                    this.uiState.deleteSuccessModalIsOpen = true;
                },
                error => this.responseOnAction = {...error, type: 'ErrorResponse'}
            );

    }

    downloadFailedReceiver(evt: Event): void {

        evt.preventDefault();

        this.uiState.failedRecordIsDownloading = true;

        this.contentSvc.getFailedReceiver(this.receiverSummary.uploadId)
            .pipe(finalize(() => this.uiState.failedRecordIsDownloading = false))
            .subscribe(
                failedReceiverUrl => {

                    const aEle: ElementRef['nativeElement'] = document.createElement('a');

                    document.body.appendChild(aEle);

                    aEle.style = 'display: none';
                    aEle.download = `FEMA-CONTENT-FAILED-RECEIVER-(${new Date().getTime()}).xls`;
                    aEle.href = failedReceiverUrl;

                    aEle.click();

                    URL.revokeObjectURL(aEle.href);

                },

                error => {
                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    downloadReceiverTemplate(evt: Event): void {

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
                }
            );

    }

    getContentNews(html: string): void {

        const firstImgSoup = new JSSoup(html).find('img');

        this.newsForm.patchValue({
            content: html,
            thumbPath: firstImgSoup ? firstImgSoup.attrs.src : '',
        });

    }

    initialSetup(): void {

        this.ar.params
            .pipe(
                switchMap(({id}) => combineLatest(
                    this.contentSvc.getLookups(),
                    this.contentSvc.getFormOptions(),
                    this.contentSvc.getResources(),
                    this.feedbackSvc.getTemplateSuggestions(),
                    this.contentSvc.getContent(id),
                    this.contentSvc.getExistingReceiver(id),
                ))
            )
            .subscribe(
                response => {

                    [
                        this.contentLookup,
                        this.formOptions,
                        this.resourcesPath,
                        this.suggestions.feedbacks,
                        this.content,
                        this.receiverSummary.successItems
                    ] = response;

                    this.bannerForm.get('imgFile').setValidators([
                        this.validators.fileTypes(['image/png', 'image/jpeg']),
                        this.validators.maxFileSize(this.contentLookup.maxBannerSize)
                    ]);

                    this.popupForm.get('imgFile').setValidators([
                        this.validators.fileTypes(['image/png', 'image/jpeg']),
                        this.validators.maxFileSize(this.contentLookup.maxBannerSize)
                    ]);

                    this.contentForm.patchValue({
                        ...this.content,
                        publishDate: this.content.publishDate ? moment(this.content.publishDate) : ''
                    });

                    if (this.content.newsDto) {

                        const newsCategory = this.formOptions.newsCategories
                            .find(newsCat => newsCat.id === this.content.newsDto.idNewsCategory);

                        this.newsForm.patchValue({
                            ...this.content.newsDto,
                            idNewsCategory: newsCategory ? newsCategory.id : ''
                        });

                        this.newsForm.get('selected').setValue(true);

                        this.contentSvc
                            .getNewsHMTL(this.newsForm.get('contentPath').value)
                            .subscribe(
                                htmlContent => {

                                    this.newsHtmlContent = htmlContent;
                                    this.newsForm.get('content').setValue(htmlContent);

                                },

                                error => {
                                    this.responseOnAction = {...error, type: 'ErrorResponse'};
                                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                                }
                            );

                        this.newsImageUrls = new JSSoup(this.newsForm.get('content').value).findAll('img').map(img => img.attrs.src);

                    }

                    if (this.content.bannerDto) {

                        this.bannerForm.patchValue({
                            ...this.content.bannerDto,
                            periodEnd: moment(this.content.bannerDto.periodEnd),
                            periodStart: moment(this.content.bannerDto.periodStart)
                        });

                        this.bannerForm.get('selected').setValue(true);

                    }

                    if (this.content.popupDto) {

                        this.popupForm.patchValue({
                            ...this.content.popupDto,
                            selected: true,
                            periodEnd: moment(this.content.popupDto.periodEnd),
                            periodStart: moment(this.content.popupDto.periodStart)
                        });

                        this.popupForm.get('selected').setValue(true);

                    }

                },
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
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

    processReceiverFile(evt: Event): void {

        evt.preventDefault();

        this.uiState.processIsPressed = true;

        if (!this.uiState.selectedFileIsValid) {

            this.uiState.selectedFileIsValid = true;

        } else {

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
                    receiverSummary => {
                        this.receiverSummary = receiverSummary;
                        this.contentForm.get('uploadId').patchValue(receiverSummary.uploadId);
                    },
                    error => {
                        this.responseOnAction = {...error, type: 'ErrorResponse'};
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                    }
                );

        }

    }

    removeDefaultBanner(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
            this.uiState.bannerDefaultModalIsOpen = false;
        }

        this.bannerForm.get('defaultBanner').setValue(false, {emitEvent: false, onlySelf: true});

        if (this.bannerForm.get('selected').value) {

            this.enableControls([
                {controlName: ['bannerDto', 'periodStart'], validator: Validators.required},
                {controlName: ['bannerDto', 'periodEnd'], validator: Validators.required},
            ]);

        }

    }

    resetBannerCalendar(formControlName: string): void {

        this.bannerForm.get(formControlName).patchValue('');

    }

    resetPopupCalendar(formControlName: string): void {

        this.popupForm.get(formControlName).patchValue('');

    }

    private saveNews(content: Content): void {

        this.resourceSvc
            .upload(
                content.newsDto.contentPath
                    ? content.newsDto.contentPath.split('/').reverse()[1]
                    : this.resourcesPath.news.folder,
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

        const bannerImgObs = content.bannerDto['imgFile']
            ? this.resourceSvc.upload(
                content.bannerDto.imgLocation
                    ? content.bannerDto.imgLocation.split('/').reverse()[1]
                    : this.resourcesPath.news.folder,
                content.bannerDto['imgFile']
            ) : of(content.bannerDto.imgLocation).pipe(first());

        bannerImgObs.pipe(
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

        const popupImgObs = content.popupDto['imgFile']
            ? this.resourceSvc.upload(
                content.popupDto.imgLocation
                    ? content.popupDto.imgLocation.split('/').reverse()[1]
                    : this.resourcesPath.news.folder,
                content.popupDto['imgFile']
            ) : of(content.popupDto.imgLocation).pipe(first());

        popupImgObs.pipe(
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

        const bannerImgObs = content.bannerDto['imgFile']
            ? this.resourceSvc.upload(
                content.bannerDto.imgLocation
                    ? content.bannerDto.imgLocation.split('/').reverse()[1]
                    : this.resourcesPath.news.folder,
                content.bannerDto['imgFile']
            ) : of(content.bannerDto.imgLocation).pipe(first());

        const popupImgObs = content.bannerDto['imgFile']
            ? this.resourceSvc.upload(
                content.popupDto.imgLocation
                    ? content.popupDto.imgLocation.split('/').reverse()[1]
                    : this.resourcesPath.news.folder,
                content.popupDto['imgFile']
            ) : of(content.popupDto.imgLocation).pipe(first());

        combineLatest(bannerImgObs, popupImgObs)
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

    selectBannerImage(evt: HTMLInputEvent) {

        evt.preventDefault();

        this.bannerForm.get('imgFile').setValue(evt.target.files.item(0));

    }

    selectPopupImage(evt: HTMLInputEvent) {

        evt.preventDefault();

        this.popupForm.get('imgFile').setValue(evt.target.files.item(0));

    }

    selectReceiverFile(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.contentForm.get('receiverFile').setValue(evt.target.files.item(0));

    }

    setAsDefaultBanner(evt?: Event) {

        if (evt) {

            evt.preventDefault();

            this.uiState.bannerDefaultModalIsOpen = false;

        }

        const defaultBanner: boolean = this.content && this.content.bannerDto && this.content.bannerDto.defaultBanner;

        if (defaultBanner === false) {

            this.bannerForm.patchValue({
                defaultBanner: true,
                periodStart: moment(this.content.bannerDto.periodStart),
                periodEnd: moment(this.content.bannerDto.periodEnd)
            }, {emitEvent: false, onlySelf: true});

        } else {

            this.bannerForm.patchValue({
                defaultBanner: true,
                periodEnd: moment(),
                periodStart: moment()
            }, {emitEvent: false, onlySelf: true});

        }

        this.bannerForm.get('periodStart').disable();
        this.bannerForm.get('periodEnd').disable();

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.contentForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

    checkPopUpTemplate(evt: Event) {

        evt.preventDefault();

        const feedback = this.suggestions.popupTitles
            .find(fdbk => (fdbk.title === this.popupForm.get('title').value) || fdbk['templateName'] === this.popupForm.get('title').value);

        if (feedback) {

            this.popupForm.get('refId').value ? of(null) : this.popupForm.get('refId').patchValue(feedback.id);

        }

    }

    checkBannerTemplate(evt: Event) {

        evt.preventDefault();

        const feedback = this.suggestions.bannerTitles
            .find(fdbk => (fdbk.title === this.bannerForm.get('title').value) || fdbk['templateName'] === this.bannerForm.get('title').value);

        if (feedback) {

            this.popupForm.get('refId').value ? of(null) : this.popupForm.get('refId').patchValue(feedback.id);

        }

    }

}
