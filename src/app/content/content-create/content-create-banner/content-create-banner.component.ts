import {ApiResourceService} from '../../../_service/api-resource.service';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {ContentLookups} from '../../_model/content.model';
import {ContentService} from '../../_service/content.service';
import {EventService} from '../../../event/_service/event.service';
import {EventSuggestion} from '../../../event/_model/event.model';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HTMLInputEvent} from '../../../_model/app.model';
import {LookupDetail} from '../../../lookup/_model/lookup.model';
import {LookupService} from '../../../lookup/_service/lookup.service';
import {MAT_DATE_FORMATS} from '@angular/material/core';
import {ResourcePath} from '../../_model/api-resource.model';
import {VideoService} from '../../../video/_service/video.service';
import {debounceTime, distinctUntilChanged, filter, skipUntil, switchMap, tap} from 'rxjs/operators';
import {combineLatest, of, Subject} from 'rxjs';
import {FeedbackTemplateSuggestion} from '../../../feedback/_model/feedback.model';
import {FeedbackService} from '../../../feedback/_service/feedback.service';
import {FemaValidator} from '../../../_validators/fema.validators';
import * as moment from 'moment';

@Component({
    selector: 'fema-cms-content-create-banner',
    templateUrl: './content-create-banner.component.html',
    styleUrls: ['./content-create-banner.component.scss'],
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
        }
    ]
})
export class ContentCreateBannerComponent implements OnInit, OnChanges {

    bannerForm: FormGroup;
    currentDate: Date;
    defaultBannerSubject: Subject<Event>;
    @Output() formEmitter: EventEmitter<FormGroup>;

    @Input() contentLookup: ContentLookups;
    @Input() linkMenu: LookupDetail[];
    @Input() resourcePath: ResourcePath;
    suggestion: {
        events: EventSuggestion[];
        feedbacks: FeedbackTemplateSuggestion[];
        titles: any[];
    };

    @Input() formDisabled: boolean;
    @Input() saveIsPressed: boolean;

    uiState: {
        bannerDefaultModalIsOpen: boolean;
        periodEndIsOpen: boolean;
        periodStartIsOpen: boolean;
    };

    readonly ngForTracker: Function = (idx: number): number => idx;

    get titleDatalist(): string {
        return this.bannerForm.get('title').value && (this.bannerForm.get('title').value.length >= this.contentLookup.minChar ? 'bannerTitleSelection' : '');
    }

    constructor(
        private formBuilder: FormBuilder,
        private resourceSvc: ApiResourceService,
        private contentSvc: ContentService,
        private eventSvc: EventService,
        private feedbackSvc: FeedbackService,
        private lookupSvc: LookupService,
        private videoSvc: VideoService,
        private validators: FemaValidator
    ) {

        this.bannerForm = this.formBuilder.group({
            selected: [false, Validators.required],
            active: {value: true, disabled: true},
            defaultBanner: {value: false, disabled: true},
            description: {value: '', disabled: true},
            id: null,
            idLinkedMenu: {value: '', disabled: true},
            imgFile: null,
            imgLocation: '',
            periodEnd: {value: '', disabled: true},
            periodStart: {value: '', disabled: true},
            refId: '',
            title: {value: '', disabled: true}
        });

        this.formEmitter = new EventEmitter();

        this.defaultBannerSubject = new Subject<Event>();

        this.suggestion = {
            events: [],
            feedbacks: [],
            titles: []
        };

        this.uiState = {
            bannerDefaultModalIsOpen: false,
            periodEndIsOpen: false,
            periodStartIsOpen: false,
        };

        this.bannerForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(title => title && (title.length > 0)),
                switchMap(title => {

                    const titleInSuggestions = this.suggestion.titles.find(suggestion => (suggestion.title ? suggestion.title : suggestion.templateName) === title);

                    if (titleInSuggestions) {
                        this.bannerForm.get('refId').patchValue(titleInSuggestions.id);
                    } else if (!titleInSuggestions) {

                        switch (this.bannerForm.get('idLinkedMenu').value) {

                            case 'CON_LINK_MENU~EVENT':
                                return this.eventSvc.getEventSuggestion(title);

                            case 'CON_LINK_MENU~FEEDBACK':
                                return titleInSuggestions ? of(null) : of(this.suggestion.feedbacks);

                            case 'CON_LINK_MENU~FIFTUBE':
                                return this.videoSvc.getVideoSuggestion(title);

                            case 'CON_LINK_MENU~NEWS_INFO':
                                return this.contentSvc.getContentSuggestion(title);

                        }

                    }

                })
            )
            .subscribe(titles => this.suggestion.titles = titles);

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
                // error => {
                //     this.responseOnAction = {...error, type: 'ErrorResponse'};
                //     $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                // }
            );

        this.bannerForm.get('selected').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(selected => {

                if (selected) {

                    this.mandatoryFields(['active', 'description', 'periodStart', 'periodEnd']);
                    this.optionalFields(['defaultBanner', 'idLinkedMenu', 'imgLocation']);

                } else {

                    this.disabledFields([
                        'active',
                        'imgLocation',
                        'defaultBanner',
                        'description',
                        'periodStart',
                        'periodEnd',
                        'idLinkedMenu',
                        'title'
                    ]);

                }

            });

        this.bannerForm.get('idLinkedMenu').valueChanges
            .subscribe(idLinkedMenu => {

                switch (idLinkedMenu) {

                    case 'CON_LINK_MENU~CULTURE':
                        this.bannerForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;

                    case 'CON_LINK_MENU~TEAM_GRAND_PRIZE':
                        this.bannerForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;


                    case 'CON_LINK_MENU~VIP_POINTS':
                        this.bannerForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;

                    case '':
                        this.bannerForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;

                    default:
                        this.bannerForm.get('title').reset();
                        this.mandatoryFields(['title']);

                        break;

                }

            });

        combineLatest(this.bannerForm.valueChanges, this.bannerForm.statusChanges).subscribe(() =>
            this.formEmitter.emit(this.bannerForm)
        );

    }

    ngOnChanges(changes: SimpleChanges) {

        if (this.bannerForm) {

            if (changes.formDisabled && changes.formDisabled.currentValue) {
                this.bannerForm.get('selected').patchValue(false);
                this.bannerForm.get('selected').disable();

            } else {

                this.bannerForm.get('selected').enable();

            }

            if (changes.linkMenu && changes.linkMenu.currentValue) {
                this.bannerForm.get('idLinkedMenu').patchValue(changes.linkMenu.currentValue[0].id);
            }

            if (changes.contentLookup && changes.contentLookup.currentValue) {

                this.bannerForm.get('imgFile').setValidators([
                    this.validators.fileTypes(['image/png', 'image/jpeg']),
                    this.validators.maxFileSize(this.contentLookup.maxBannerSize)
                ]);

            }

            this.formEmitter.emit(this.bannerForm);

            // if (!this.bannerForm.getRawValue().defaultBanner) {
            //
            //     this.bannerForm.get('defaultBanner').valueChanges
            //         .pipe(
            //             debounceTime(300),
            //             switchMap(isDefault => (isDefault ? this.contentSvc.defaultBannerIsExist() : of(false)))
            //         )
            //         .subscribe(bannerDefaultModalIsOpen => this.uiState.bannerDefaultModalIsOpen = bannerDefaultModalIsOpen);
            //
            // } else {
            //
            //     this.setAsDefaultBanner();
            //
            // }

        }

    }

    ngOnInit() {

        this.currentDate = new Date();

        this.feedbackSvc.getTemplateSuggestions()
            .subscribe(feedbacks => this.suggestion.feedbacks = feedbacks);

    }

    private mandatoryFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.bannerForm.get(name).setValidators(Validators.required);
            this.bannerForm.get(name).enable();
            this.bannerForm.get(name).updateValueAndValidity({onlySelf: true});
        });
    }

    private optionalFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.bannerForm.get(name).clearValidators();
            this.bannerForm.get(name).enable();
            this.bannerForm.get(name).updateValueAndValidity({onlySelf: true});
        });
    }

    private disabledFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.bannerForm.get(name).clearValidators();
            this.bannerForm.get(name).disable();
            this.bannerForm.get(name).updateValueAndValidity({onlySelf: true});
        });
    }

    removeDefaultBanner(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.bannerForm.get('defaultBanner').patchValue(false, {emitEvent: false, onlySelf: true});
        this.mandatoryFields(['periodStart', 'periodEnd']);

        this.uiState.bannerDefaultModalIsOpen = false;

    }

    setAsDefaultBanner(evt?: Event) {

        if (evt) {

            evt.preventDefault();

            this.uiState.bannerDefaultModalIsOpen = false;

        }

        this.bannerForm.patchValue({
            defaultBanner: true,
            periodStart: moment(),
            periodEnd: moment()
        }, {emitEvent: false, onlySelf: true});

        this.bannerForm.get('periodStart').disable();
        this.bannerForm.get('periodEnd').disable();

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.bannerForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] && this.saveIsPressed : false;

        }

        return ctrl.invalid && this.saveIsPressed;

    }

    resetCalendar(formControlName: string): void {

        this.bannerForm.get(formControlName).patchValue('');

    }

    selectBannerImage(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.bannerForm.get('imgFile').setValue(evt.target.files.item(0));

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.bannerForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

    checkTemplate(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        const feedback = this.suggestion.titles
            .find(fdbk => (fdbk.title ? fdbk.title : fdbk.templateName) === this.bannerForm.get('title').value);

        if (!feedback) {
            this.bannerForm.get('title').reset();
        } 

    }



}
