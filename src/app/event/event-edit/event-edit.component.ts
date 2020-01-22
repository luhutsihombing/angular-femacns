import {MAT_DATE_FORMATS} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import * as $ from 'jquery';
import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {EventParticipant} from '../_model/event.model';
import {EventService} from '../_service/event.service';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LookupService} from '../../lookup/_service/lookup.service';
import {FeedbackService} from '../../feedback/_service/feedback.service';
import {debounceTime, distinctUntilChanged, filter, finalize, first, map, switchMap, takeUntil} from 'rxjs/operators';
import {HcmsService} from '../../_service/hcms.service';
import {ActionResponse, ErrorResponse, GenericResponse} from '../../_model/app.model';
import {combineLatest, interval, Observable, of} from 'rxjs';
import {FemaValidator} from '../../_validators/fema.validators';
import {CONTENT_RECEIVERS} from '../../content/_const/content.const';
import {STANDARD_STRING_SELECTION} from '../../_const/standard.const';
import {FeedbackTemplateSuggestion} from '../../feedback/_model/feedback.model';
import * as moment from 'moment';
import {API_EVENT_POST_UNIQUE_TITLE} from '../../_const/api.const';

interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}

@Component({
    selector: 'fema-cms-event-edit',
    templateUrl: './event-edit.component.html',
    styleUrls: ['./event-edit.component.scss'],
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
export class EventEditComponent implements OnInit {

    @ViewChild('clrContentArea') clrContentArea: ElementRef;
    currentDateTime: Observable<object>;
    eventForm: FormGroup;

    participant: EventParticipant;
    option: {
        eventCategories: Array<{ value: string, label: string }>;
        eventTypes: Array<{ value: string, label: string }>;
        participants: Array<{ value: string, label: string }>;
        speakerTypes: Array<{ value: string, label: string }>;
    };
    suggestion: {
        employees: Array<{ label: string, value: string }>;
        feedbacks: FeedbackTemplateSuggestion[];
    };

    responseOnAction: ActionResponse;
    errorOnInit: ErrorResponse;

    lookup: {
        minChar: number;
        pageSize: number;
    };

    countChange: number;

    uiState: {
        cancelModalIsOpen: boolean;
        deleteIsDisabled: boolean;
        deleteModalIsOpen: boolean;
        deleteSuccessModalIsOpen: boolean;
        endDateIsOpen: boolean;
        failedRecordIsDownloading: boolean;
        isDeleting: boolean;
        isSaving: boolean;
        noRemainderSelected: boolean;
        participantIsProcessing: boolean;
        periodIsValid: boolean;
        processIsPressed: boolean;
        saveIsPressed: boolean;
        saveModalIsOpen: boolean;
        saveSuccessModalIsOpen: boolean;
        startDateIsOpen: boolean;
        templateIsDownloading: boolean;
    };

    get addSpeakerIsDisabled(): boolean {
        return !this.eventForm.get('needFeedback').value || this.startDateHasPassed || this.eventForm.getRawValue().type === 'SURVEY';
    }

    get enableProcess(): boolean {
        return this.eventForm.get('participantFile').valid;
    }

    get enableRemainderSelections(): boolean {
        return this.eventForm.get('reminder').value;
    }

    get enableUploadParticipant(): boolean {
        return this.eventForm.get('targetParticipant').value === 'PRIVATE';
    }

    get endDateHasPassed(): boolean {
        return this.eventForm.get('endDate').value <= moment();
    }

    get invalidPeriod(): boolean {
        return !this.uiState.periodIsValid && this.uiState.saveIsPressed;
    }

    get invalidReminder(): boolean {
        return this.eventForm.get('reminder').value && this.uiState.noRemainderSelected && this.uiState.saveIsPressed;
    }

    get listSpeakerForm(): FormArray {
        return <FormArray>this.eventForm.get('listSpeaker');
    }

    get removeSpeakerIsDisabled(): boolean {
        return this.listSpeakerForm.getRawValue().filter(speaker => speaker.selected).length === 0;
    }

    get startDateHasPassed(): boolean {
        return this.eventForm.get('startDate').value <= moment();
    }

    get templateDatalist(): string {
        return this.eventForm.get('template').value.length >= this.lookup.minChar ? 'feedbackSuggestion' : '';
    }

    set resetCalendar(selector: string) {
        this.eventForm.get(selector).patchValue('');
    }

    private createSpeakerForm(): FormGroup {

        const speakerForm: FormGroup = this.fb.group({
            selected: false,
            id: [''],
            material: ['', Validators.required],
            speakerId: [''],
            speakerName: ['', Validators.required],
            speakerType: ['', Validators.required]
        });

        speakerForm.get('speakerType').valueChanges
            .pipe(
                distinctUntilChanged(),
                filter(speakerType =>
                    speakerType === 'INTERNAL' && speakerForm.get('speakerName').value
                ),
                switchMap(() => this.eventSvc.getNpk(speakerForm.get('speakerName').value.split('-')[1])),
                map(employees => employees.findIndex(
                    ({fullName, username}) => `${username}-${fullName}` === speakerForm.get('speakerName').value
                ) === -1)
            )
            .subscribe(speakerIsNotExist => speakerIsNotExist ? speakerForm.get('speakerName').reset() : null);

        speakerForm.get('speakerName').valueChanges
            .pipe(
                debounceTime(300),
                filter(speakerName =>
                    speakerForm.get('speakerType').value === 'INTERNAL'
                    && speakerName
                    && (speakerName.length >= this.lookup.minChar)
                    && (this.suggestion.employees.findIndex(({value}) => value === speakerName) === -1)
                ),
                distinctUntilChanged(),
                switchMap(speakerName => this.eventSvc.getNpk(speakerName)),
                map(employees =>
                    employees.map(({fullName, username}) => ({label: fullName, value: `${username}-${fullName}`}))
                )
            )
            .subscribe(employees => this.suggestion.employees = employees);

        return speakerForm;

    }

    private enableControls(controlOptions: Array<any[]>): void {

        for (const [controlName, validators] of controlOptions) {

            this.eventForm.get(controlName).enable();
            this.eventForm.get(controlName).setValidators(validators);
            this.eventForm.get(controlName).updateValueAndValidity({onlySelf: true});

        }

    }

    private disableControls(controlNames: string[]): void {

        for (const controlName of controlNames) {

            this.eventForm.get(controlName).disable();
            this.eventForm.get(controlName).clearValidators();
            this.eventForm.get(controlName).updateValueAndValidity({onlySelf: true});

        }

    }

    constructor(
        private ar: ActivatedRoute,
        private fb: FormBuilder,
        private eventSvc: EventService,
        private feedbackSvc: FeedbackService,
        private hcmsSvc: HcmsService,
        private lookupSvc: LookupService,
        private validators: FemaValidator,
    ) {

        this.currentDateTime = interval(1000).pipe(map(() => moment()));

        this.option = {
            eventCategories: [
                {label: 'Training', value: 'TRAINING'},
                {label: 'Non-training', value: 'NON_TRAINING'},
            ],
            eventTypes: STANDARD_STRING_SELECTION.concat([
                {label: 'Survey', value: 'SURVEY'},
                {label: 'Culture', value: 'CULTURE'},
                {label: 'Knowledge Sharing', value: 'KNOWLEDGE_SHARING'},
                {label: 'Others', value: 'OTHERS'},
            ]),
            participants: STANDARD_STRING_SELECTION.concat(CONTENT_RECEIVERS),
            speakerTypes: STANDARD_STRING_SELECTION.concat([
                {label: 'External', value: 'EXTERNAL'},
                {label: 'Internal', value: 'INTERNAL'},
            ])
        };

        this.suggestion = {
            employees: [],
            feedbacks: []
        };

        this.eventForm = fb.group({
            category: [{value: this.option.eventCategories[0].value, disabled: true}, Validators.required],
            email: false,
            endDate: ['', Validators.required],
            endTime: ['', Validators.required],
            eventName: [
                '',
                [Validators.required, Validators.maxLength(150)],
                validators.unique(API_EVENT_POST_UNIQUE_TITLE, 'id')
            ],
            feedbackId: '',
            mandatory: [{value: false, disabled: true}],
            needFeedback: [{value: false, disabled: true}],
            id: '',
            listReminder: fb.group({
                TENMINUTES_BEFORE: false,
                ONEHOURS_BEFORE: false,
                EVERYHOUR: false,
                ONEDAY_BEFORE: false,
                TWODAY_BEFORE: false,
                EVERYDAY: false
            }),
            listSpeaker: fb.array([]),
            place: ['', Validators.maxLength(150)],
            participantFile: null,
            pushNotification: false,
            reminder: false,
            selectAllSpeaker: false,
            startDate: ['', Validators.required],
            startTime: ['', Validators.required],
            targetParticipant: ['', Validators.required],
            template: [{value: '', disabled: true}],
            type: [{value: '', disabled: true}, Validators.required],
            uploadId: null
        });

        this.participant = {} as EventParticipant;

        this.uiState = {
            cancelModalIsOpen: false,
            deleteIsDisabled: false,
            deleteModalIsOpen: false,
            deleteSuccessModalIsOpen: false,
            endDateIsOpen: false,
            failedRecordIsDownloading: false,
            isDeleting: false,
            isSaving: false,
            noRemainderSelected: true,
            participantIsProcessing: false,
            periodIsValid: false,
            processIsPressed: false,
            saveIsPressed: false,
            saveModalIsOpen: false,
            saveSuccessModalIsOpen: false,
            startDateIsOpen: false,
            templateIsDownloading: false,
        };

        this.lookup = {
            minChar: 2,
            pageSize: 20,
        };

        this.countChange = 0;

    }

    ngOnInit() {

        this.initialSetup();

        this.eventForm.get('type').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(eventType => {

                switch (eventType) {

                    case '':
                        this.eventForm.get('mandatory').disable();
                        this.eventForm.get('mandatory').clearValidators();
                        this.eventForm.get('mandatory').updateValueAndValidity();

                        this.eventForm.get('needFeedback').disable();
                        this.eventForm.get('needFeedback').clearValidators();
                        this.eventForm.get('needFeedback').patchValue(false);
                        this.eventForm.get('needFeedback').updateValueAndValidity();

                        this.disabledListSpeaker();

                        this.eventForm.get('template').disable();
                        this.eventForm.get('template').clearValidators();
                        this.eventForm.get('template').updateValueAndValidity();

                        break;

                    case 'CULTURE':

                        this.eventForm.get('mandatory').enable();
                        this.eventForm.get('mandatory').setValidators(Validators.required);
                        this.eventForm.get('mandatory').updateValueAndValidity();

                        this.eventForm.get('needFeedback').disable();
                        this.eventForm.get('needFeedback').clearValidators();
                        this.eventForm.get('needFeedback').patchValue(false);
                        this.eventForm.get('needFeedback').updateValueAndValidity();

                        this.disabledListSpeaker();

                        this.eventForm.get('template').disable();
                        this.eventForm.get('template').clearValidators();
                        this.eventForm.get('template').patchValue('');
                        this.eventForm.get('template').updateValueAndValidity();

                        break;

                    case 'SURVEY':

                        this.eventForm.get('mandatory').enable();
                        this.eventForm.get('mandatory').setValidators(Validators.required);
                        this.eventForm.get('mandatory').updateValueAndValidity();

                        this.eventForm.get('needFeedback').disable();
                        this.eventForm.get('needFeedback').setValidators(Validators.requiredTrue);
                        this.eventForm.get('needFeedback').patchValue(true);
                        this.eventForm.get('needFeedback').updateValueAndValidity();

                        this.disabledListSpeaker();

                        this.eventForm.get('template').enable();
                        this.eventForm.get('template').setValidators(Validators.required);
                        this.eventForm.get('template').updateValueAndValidity();

                        break;

                    default:

                        this.eventForm.get('mandatory').enable();
                        this.eventForm.get('mandatory').setValidators(Validators.required);
                        this.eventForm.get('mandatory').updateValueAndValidity();

                        this.eventForm.get('needFeedback').enable();
                        this.eventForm.get('needFeedback').setValidators(Validators.required);
                        this.eventForm.get('needFeedback').patchValue(false);
                        this.eventForm.get('needFeedback').updateValueAndValidity();

                        break;

                }

            });

        this.eventForm.get('needFeedback').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(needFeedback => {

                if (this.countChange > 0) {

                    if (
                        this.eventForm.get('type').value === 'KNOWLEDGE_SHARING'
                        || this.eventForm.get('type').value === 'OTHERS'
                    ) {

                        if (needFeedback) {

                            this.eventForm.get('listSpeaker').enable();
                            this.eventForm.get('listSpeaker').setValidators(Validators.required);

                            this.eventForm.get('template').enable();
                            this.eventForm.get('template').setValidators(Validators.required);
                            this.eventForm.get('template').updateValueAndValidity();


                        } else {

                            this.disabledListSpeaker();

                            this.eventForm.get('template').disable();
                            this.eventForm.get('template').clearValidators();
                            this.eventForm.get('template').updateValueAndValidity();

                        }

                    }
                }

            this.countChange = this.countChange + 1;

            });

        this.eventForm.get('selectAllSpeaker').valueChanges.subscribe(selectAll =>
            this.listSpeakerForm.controls.forEach(speakerControl =>
                speakerControl.get('selected').patchValue(selectAll)
            )
        );

        this.eventForm.get('targetParticipant').valueChanges
            .pipe(
                distinctUntilChanged(),
                takeUntil(
                    of(this.startDateHasPassed).pipe(filter(startDateHasPassed => startDateHasPassed === true))
                ),
            )
            .subscribe(participant => {

                switch (participant) {

                    case 'PUBLIC':

                        this.disableControls(['uploadId', 'participantFile']);

                        break;

                    case 'PRIVATE':

                        const noSuccessItem: boolean =
                            !this.participant
                            || !this.participant.successItems
                            || (
                                this.participant
                                && this.participant.successItems
                                && this.participant.successItems.length === 0
                            );

                        if (noSuccessItem) {

                            this.enableControls([
                                ['uploadId', Validators.required],
                                ['participantFile', [
                                    Validators.required,
                                    this.validators.fileTypes(['application/vnd.ms-excel'])
                                ]]
                            ]);

                        }

                        break;

                }

            });

        combineLatest(
            this.eventForm.get('startDate').valueChanges,
            this.eventForm.get('endDate').valueChanges,
        )
            .subscribe(([startDate, endDate]) => {

                if (typeof(startDate) === 'object' && typeof(endDate) === 'object') {

                    this.uiState.periodIsValid = this.eventForm.get('startDate').value <= this.eventForm.get('endDate').value;

                }

            });

        this.eventForm.get('startTime').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(startTime => {

                this.eventForm.get('startDate').value.set('hour', +startTime.split(':')[0]);
                this.eventForm.get('startDate').value.set('minute', +startTime.split(':')[1]);

            });

        this.eventForm.get('endTime').valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(endTime => {

                this.eventForm.get('endDate').value.set('hour', +endTime.split(':')[0]);
                this.eventForm.get('endDate').value.set('minute', +endTime.split(':')[1]);

            });

        combineLatest(
            this.eventForm.get('reminder').valueChanges,
            this.eventForm.get('listReminder').valueChanges
        )
            .subscribe(([reminder, listReminder]) => {

                if (reminder) {

                    this.uiState.noRemainderSelected = Object
                        .values(listReminder)
                        .filter(r => r === true)
                        .length === 0;

                } else {

                    this.uiState.noRemainderSelected = false;

                }

            });

    }

    initialSetup(): void {

        this.ar.params
            .pipe(
                filter(params => params.hasOwnProperty('id')),
                first(),
                switchMap(({id}) => combineLatest(
                    this.feedbackSvc.getTemplateSuggestions(),
                    this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MIN_CHAR'),
                    this.lookupSvc.getNumericDetailMeaning('GLOBAL_SETUP~MAX_ROW'),
                    this.eventSvc.getEventId(id),
                    this.feedbackSvc.getNameFromEvent(id),
                )),
                switchMap(([feedbacks, minChar, pageSize, event, feedbackName]) => {

                    this.suggestion.feedbacks = feedbacks;
                    this.lookup = {minChar, pageSize};

                    if (feedbackName.hasOwnProperty('data')) {

                        this.eventForm.get('template').patchValue(feedbackName.data.toString());

                        this.eventForm.get('feedbackId').patchValue(
                            this.suggestion.feedbacks
                                .find(feedback => feedback.templateName === feedbackName.data.toString()).id
                        );

                    }

                    event.listSpeaker.forEach(() => {

                        this.addSpeaker();
                        this.eventForm.get('template').setValidators(Validators.required);

                    });

                    const startDate = moment(event.startDate);
                    const endDate = moment(event.endDate);

                    this.eventForm.patchValue({
                        ...event, startDate, endDate,
                        // needFeedback: event.type === 'SURVEY' ? false : event.needFeedback,
                        startTime: startDate.format('HH:mm'),
                        endTime: endDate.format('HH:mm')
                    });

                    event.listReminder.forEach(({reminder}) =>
                        this.eventForm.get(['listReminder', reminder]).patchValue(true)
                    );

                    if (this.startDateHasPassed) {

                        this.eventForm.disable();
                        this.eventForm.get('endDate').enable();
                        this.eventForm.get('endTime').enable();

                        this.uiState.deleteIsDisabled = true;

                    }

                    if (this.endDateHasPassed) {

                        this.eventForm.get('endDate').disable();
                        this.eventForm.get('endTime').disable();

                        this.uiState.deleteIsDisabled = false;

                    }

                    return this.eventSvc.getParticipants(event.id);

                })
            )
            .subscribe(
                participant => this.participant = participant,
                error => {
                    this.errorOnInit = {...error, type: 'ErrorResponse'};
                    $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');
                }
            );

    }

    disabledListSpeaker(): void {

        this.eventForm.get('listSpeaker').disable();
        this.eventForm.get('listSpeaker').clearValidators();

        while (this.listSpeakerForm.length > 0) {
            this.listSpeakerForm.removeAt(0);
        }

    }

    addSpeaker(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.listSpeakerForm.push(this.createSpeakerForm());

    }

    checkTemplate(evt: Event) {

        evt.preventDefault();

        const feedback = this.suggestion.feedbacks
            .find(fdbk => fdbk.templateName === this.eventForm.get('template').value);

        if (feedback) {

            this.eventForm.get('feedbackId').patchValue(feedback.id);

        } else {

            this.eventForm.get('feedbackId').patchValue('');
            this.eventForm.get('template').patchValue('');

        }

    }

    checkSpeakerName(speakerType: string, control: AbstractControl, evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        if (speakerType === 'INTERNAL') {

            const speakerIsExist = this.suggestion.employees.find(({value}) => value === control.value);

            if (!speakerIsExist) {
                control.reset();
            }
        }

    }

    removeSpeaker(evt: Event) {

        evt.preventDefault();

        this.listSpeakerForm
            .getRawValue()
            .map((material, idx) => (material.selected ? idx : -1))
            .filter(idx => idx > -1)
            .reverse()
            .forEach(idx => this.listSpeakerForm.removeAt(idx));

        this.eventForm.get('selectAllSpeaker').patchValue(false, {emitEvent: false});

    }

    selectFile(evt: HTMLInputEvent): void {

        evt.preventDefault();

        this.eventForm.get('participantFile').patchValue(evt.target.files.item(0));

    }

    getTargetTemplate(evt: Event): void {

        evt.preventDefault();

        this.uiState.templateIsDownloading = true;

        this.hcmsSvc.getUploadTemplate()
            .pipe(finalize(() => this.uiState.templateIsDownloading = false))
            .subscribe(templateUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.download = `FEMA-EVENT-PARTICIPANT-TEMPLATE-(${new Date().getTime()}).xls`;
                aEle.href = templateUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }

    processFile(evt: Event): void {

        evt.preventDefault();

        this.uiState.processIsPressed = true;

        if (this.enableProcess) {

            this.uiState.participantIsProcessing = true;

            this.eventSvc.registerParticipant(this.eventForm.get('participantFile').value)
                .pipe(
                    finalize(() => this.uiState = {
                        ...this.uiState,
                        participantIsProcessing: false,
                        processIsPressed: false
                    })
                )
                .subscribe(
                    participant => {

                        this.participant = participant;
                        this.eventForm.get('uploadId').patchValue(participant.uploadId);

                    },
                    error => {

                        this.responseOnAction = {...error, type: 'ErrorResponse'};
                        $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

                    }
                );

        }

    }

    getFailedParticipant(evt: Event): void {

        evt.preventDefault();

        this.uiState.failedRecordIsDownloading = true;

        this.eventSvc.getFailedParticipant(this.eventForm.get('uploadId').value)
            .pipe(finalize(() => this.uiState.failedRecordIsDownloading = false))
            .subscribe(templateUrl => {

                const aEle: ElementRef['nativeElement'] = document.createElement('a');

                document.body.appendChild(aEle);

                aEle.download = `FEMA-EVENT-PARTICIPANT-FAILED-RECORD-(${this.eventForm.get('uploadId').value}).xls`;
                aEle.href = templateUrl;

                aEle.click();

                URL.revokeObjectURL(aEle.href);

            });

    }

    invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.eventForm.get(control);

        if (errorType) {

            return ctrl.hasError(errorType)
                ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

        }

        return ctrl.invalid && this.uiState.saveIsPressed;

    }

    showError(control: AbstractControl | string | string[], errorType?: string): any {

        const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.eventForm.get(control);

        if (errorType) {

            return ctrl.errors && ctrl.errors[errorType]
                ? ctrl.errors[errorType] : null;

        }

        return null;

    }

    checkFormValidity(evt?: Event): void {

        evt.preventDefault();

        this.uiState.saveIsPressed = true;

        const emptySpeaker: boolean = this.eventForm.get('type').value === 'KNOWLEDGE_SHARING'
            && this.listSpeakerForm.length === 0;


        if (this.eventForm.valid && this.uiState.periodIsValid) {

            this.uiState = {
                ...this.uiState,
                saveIsPressed: false,
                saveModalIsOpen: true
            };

        } else if (emptySpeaker) {

            this.responseOnAction = {
                ...{} as ErrorResponse,
                message: 'At least 1 speaker must me added',
                type: 'ErrorResponse'
            };

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        } else {

            $(this.clrContentArea.nativeElement).animate({scrollTop: 0}, 500, 'swing');

        }

    }

    delete(): void {

        let deleteEvent: Observable<GenericResponse> = this.eventSvc.deleteEvent(this.eventForm.get('id').value);

        if (this.eventForm.get('template').value !== '') {

            deleteEvent = deleteEvent.pipe(
                switchMap(() => this.feedbackSvc.deleteEventMapping(this.eventForm.get('id').value))
            );

        }

        deleteEvent
            .pipe(
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

    save(): void {

        this.uiState.isSaving = true;

        const eventSave = {
            ...this.eventForm.getRawValue(),
            eventName: this.eventForm.getRawValue().eventName.trim(),
            // needFeedback: this.eventForm.get('template').value === '' ? this.eventForm.get('needFeedback').value : true,
            template: null,
            listReminder: this.eventForm.get('reminder').value
                ? Object.entries(this.eventForm.get('listReminder').value)
                    .filter(([key, value]) => value === true)
                    .map(([reminder]) => ({reminder}))
                : []
        };

        delete eventSave.endTime;
        delete eventSave.feedbackId;
        delete eventSave.startTime;
        delete eventSave.participantFile;

        eventSave.endDate.set('hour', this.eventForm.get('endTime').value.split(':')[0]);
        eventSave.endDate.set('minute', this.eventForm.get('endTime').value.split(':')[1]);

        eventSave.startDate.set('hour', this.eventForm.get('startTime').value.split(':')[0]);
        eventSave.startDate.set('minute', this.eventForm.get('startTime').value.split(':')[1]);

        const saveObs = this.eventForm.get('template').value
            ? this.eventSvc.saveEvent(eventSave).pipe(
                map(feedback => ({
                    feedbackId: this.eventForm.get('feedbackId').value,
                    itemEndDate: feedback.endDate,
                    itemId: feedback.id,
                    itemName: feedback.eventName,
                    itemStartDate: feedback.startDate,
                    itemType: 'EVENT'
                })),
                switchMap(feedback => this.feedbackSvc.saveEventMapping(feedback))
            ) : this.eventSvc.saveEvent(eventSave);

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

}
