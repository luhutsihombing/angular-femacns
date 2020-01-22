import {ApiResourceService} from '../../../_service/api-resource.service';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
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
import {MAT_DATE_FORMATS} from '@angular/material';
import {ResourcePath} from '../../_model/api-resource.model';
import {VideoService} from '../../../video/_service/video.service';
import {combineLatest, of} from 'rxjs';
import {FeedbackService} from '../../../feedback/_service/feedback.service';
import {FeedbackTemplateSuggestion} from '../../../feedback/_model/feedback.model';
import {FemaValidator} from '../../../_validators/fema.validators';

@Component({
    selector: 'fema-cms-content-create-popup',
    templateUrl: './content-create-popup.component.html',
    styleUrls: ['./content-create-popup.component.scss'],
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
export class ContentCreatePopupComponent implements OnInit, OnChanges {

    currentDate: Date;
    @Output() formEmitter: EventEmitter<FormGroup>;
    popupForm: FormGroup;

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
        periodEndIsOpen: boolean;
        periodStartIsOpen: boolean;
    };

    readonly ngForTracker: Function = (idx: number): number => idx;

    get titleDatalist(): string {
        return this.popupForm.get('title').value && this.popupForm.get('title').value.length >= this.contentLookup.minChar ? 'popUpTitleSelection' : '';
    }

    private mandatoryFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.popupForm.get(name).setValidators(Validators.required);
            this.popupForm.get(name).enable();
            this.popupForm.get(name).updateValueAndValidity({onlySelf: true});
        });
    }

    private optionalFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.popupForm.get(name).clearValidators();
            this.popupForm.get(name).enable();
            this.popupForm.get(name).updateValueAndValidity({onlySelf: true});
        });
    }

    private disabledFields(fieldNames: string[]): void {
        fieldNames.forEach(name => {
            this.popupForm.get(name).clearValidators();
            this.popupForm.get(name).disable();
            this.popupForm.get(name).updateValueAndValidity({onlySelf: true});
        });
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

        this.popupForm = this.formBuilder.group({
            selected: [false, Validators.required],
            active: [{value: true, disabled: true}],
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

        this.suggestion = {
            events: [],
            feedbacks: [],
            titles: []
        };

        this.uiState = {
            periodEndIsOpen: false,
            periodStartIsOpen: false,
        };

        this.popupForm.get('title').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                filter(title => title && title.length > 0),
                switchMap(title => {

                    const titleInSuggestions = this.suggestion.titles.find(suggestion => (suggestion.title ? suggestion.title : suggestion.templateName) === title);

                    if (titleInSuggestions) {

                        this.popupForm.get('refId').patchValue(titleInSuggestions.id);

                    } else if (!titleInSuggestions) {

                        switch (this.popupForm.get('idLinkedMenu').value) {

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

        this.popupForm.get('selected').valueChanges.subscribe(selected => {

            if (selected) {

                this.mandatoryFields(['active', 'description', 'periodStart', 'periodEnd']);
                this.optionalFields(['idLinkedMenu', 'imgLocation']);

            } else {

                this.disabledFields([
                    'active',
                    'imgLocation',
                    'description',
                    'periodStart',
                    'periodEnd',
                    'idLinkedMenu',
                    'title'
                ]);

            }

        });

        this.popupForm.get('idLinkedMenu').valueChanges
            .subscribe(idLinkedMenu => {

                switch (idLinkedMenu) {

                    case 'CON_LINK_MENU~CULTURE':
                        this.popupForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;

                    case 'CON_LINK_MENU~TEAM_GRAND_PRIZE':
                        this.popupForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;


                    case 'CON_LINK_MENU~VIP_POINTS':
                        this.popupForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;

                    case '':
                        this.popupForm.get('title').reset();
                        this.disabledFields(['title']);

                        break;

                    default:
                        this.popupForm.get('title').reset();
                        this.mandatoryFields(['title']);

                        break;

                }

            });

        combineLatest(this.popupForm.valueChanges, this.popupForm.statusChanges).subscribe(() =>
            this.formEmitter.emit(this.popupForm)
        );

    }

    ngOnChanges(changes: SimpleChanges) {

        if (this.popupForm) {

            if (changes.formDisabled && changes.formDisabled.currentValue) {

                this.popupForm.get('selected').patchValue(false);
                this.popupForm.get('selected').disable();

            } else {

                this.popupForm.get('selected').enable();

            }

            if (changes.linkMenu && changes.linkMenu.currentValue) {

                this.popupForm.get('idLinkedMenu').patchValue(changes.linkMenu.currentValue[0].id);

            }

            if (changes.contentLookup && changes.contentLookup.currentValue) {

                this.popupForm.get('imgFile').setValidators([
                    this.validators.fileTypes(['image/png', 'image/jpeg']),
                    this.validators.maxFileSize(this.contentLookup.maxPopupSize)
                ]);

            }

            this.formEmitter.emit(this.popupForm);

        }

    }

    ngOnInit() {

        this.currentDate = new Date();

        this.feedbackSvc.getTemplateSuggestions()
            .subscribe(feedbacks => this.suggestion.feedbacks = feedbacks);

    }

    checkTemplate(evt: Event) {

        evt.preventDefault();

        const feedback = this.suggestion.titles
            .find(fdbk => (fdbk.title ? fdbk.title : fdbk.templateName) === this.popupForm.get('title').value);

        if (feedback) {

            this.popupForm.get('refId').value ? of(null) : this.popupForm.get('refId').patchValue(feedback.id);

        }

        if (!feedback) {
            this.popupForm.get('title').reset();
        } 

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.popupForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] && this.saveIsPressed : false;

        }

        return ctrl.invalid && this.saveIsPressed;

    }

    resetCalendar(formControlName: string): void {

        this.popupForm.get(formControlName).patchValue('');

    }

    selectPopupImage(evt: HTMLInputEvent) {

        evt.preventDefault();

        this.popupForm.get('imgFile').setValue(evt.target.files.item(0));

        // const file: File = evt.target.files.item(0);
        // const fileIsImage: boolean = file && (file.type === 'image/png' || file.type === 'image/jpeg');
        // const fileSizeIsValid: boolean = file && file.size <= this.contentLookup.maxPopupSize * 1000;
        //
        // if (fileIsImage && fileSizeIsValid) {
        //     this.imageIsValid = true;
        //
        //     this.uploadValidationMessage = '';
        //
        //     this.resourceSvc.upload(this.resourcePath.folder, evt.target.files.item(0)).subscribe(filePath => {
        //         this.popupForm.get('imgLocation').patchValue(filePath);
        //         this.uploadingPopupImage = false;
        //     }, error => error);
        // } else if (!fileIsImage) {
        //     this.uploadValidationMessage = 'Not a valid image format';
        //     this.imageIsValid = false;
        //     evt.target.value = '';
        // } else if (!fileSizeIsValid) {
        //     this.uploadValidationMessage = 'Maximum size allowed is ' + this.contentLookup.maxPopupSize / 1000 + ' MB';
        //     this.imageIsValid = false;
        //     evt.target.value = '';
        // }

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.popupForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

}
