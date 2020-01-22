import {Event as Evt} from '../_model/event.model';
import {EventService} from '../_service/event.service';
import {ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {FormGroup, FormBuilder} from '@angular/forms';
import {switchMap} from 'rxjs/operators';
import {FeedbackService} from '../../feedback/_service/feedback.service';

@Component({
    selector: 'fema-cms-event-view',
    templateUrl: './event-view.component.html',
    styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit {

    viewEventForm: FormGroup;
    event: Evt;

    error: any;

    type: any;

    feedbackName: string;
    needFeedback: boolean;

    listMemberIsView: boolean;

    constructor(
        private activatedRoute: ActivatedRoute,
        private location: Location,
        private eventService: EventService,
        public formBuilder: FormBuilder,
        private feedbackSvc: FeedbackService
    ) {
        this.viewEventForm = formBuilder.group({
            listReminder: formBuilder.group({
                TENMINUTES_BEFORE: {value: false, disabled: true},
                ONEHOURS_BEFORE: {value: false, disabled: true},
                EVERYHOUR: {value: false, disabled: true},
                ONEDAY_BEFORE: {value: false, disabled: true},
                TWODAY_BEFORE: {value: false, disabled: true},
                EVERYDAY: {value: false, disabled: true},
                disabled: true
            })
        });
    }

    ngOnInit() {
        this.initViewEvent();

        this.event = {} as Evt;

    }

    initViewEvent(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
            this.error = undefined;
        }

        this.activatedRoute.params
            .pipe(switchMap(params => this.eventService.getEventId(params.id)))
            .subscribe(event => {
                this.feedbackSvc.getNameFromEvent(event.id).subscribe(feedback =>
                    this.feedbackName = feedback.data
                );

                this.listMemberIsView = event.listMember.length > 0;

                const list = {
                    TENMINUTES_BEFORE: (event.listReminder[0] ? event.listReminder[0].reminder === 'TENMINUTES_BEFORE' : false),
                    ONEHOURS_BEFORE:
                    (event.listReminder[0] ? event.listReminder[0].reminder === 'ONEHOURS_BEFORE' : false) ||
                    (event.listReminder[1] ? event.listReminder[1].reminder === 'ONEHOURS_BEFORE' : false),
                    EVERYHOUR:
                    (event.listReminder[0] ? event.listReminder[0].reminder === 'EVERYHOUR' : false) ||
                    (event.listReminder[1] ? event.listReminder[1].reminder === 'EVERYHOUR' : false) ||
                    (event.listReminder[2] ? event.listReminder[2].reminder === 'EVERYHOUR' : false),
                    ONEDAY_BEFORE:
                    (event.listReminder[0] ? event.listReminder[0].reminder === 'ONEDAY_BEFORE' : false) ||
                    (event.listReminder[1] ? event.listReminder[1].reminder === 'ONEDAY_BEFORE' : false) ||
                    (event.listReminder[2] ? event.listReminder[2].reminder === 'ONEDAY_BEFORE' : false) ||
                    (event.listReminder[3] ? event.listReminder[3].reminder === 'ONEDAY_BEFORE' : false),
                    TWODAY_BEFORE:
                    (event.listReminder[0] ? event.listReminder[0].reminder === 'TWODAY_BEFORE' : false) ||
                    (event.listReminder[1] ? event.listReminder[1].reminder === 'TWODAY_BEFORE' : false) ||
                    (event.listReminder[2] ? event.listReminder[2].reminder === 'TWODAY_BEFORE' : false) ||
                    (event.listReminder[3] ? event.listReminder[3].reminder === 'TWODAY_BEFORE' : false) ||
                    (event.listReminder[4] ? event.listReminder[4].reminder === 'TWODAY_BEFORE' : false),
                    EVERYDAY:
                    (event.listReminder[0] ? event.listReminder[0].reminder === 'EVERYDAY' : false) ||
                    (event.listReminder[1] ? event.listReminder[1].reminder === 'EVERYDAY' : false) ||
                    (event.listReminder[2] ? event.listReminder[2].reminder === 'EVERYDAY' : false) ||
                    (event.listReminder[3] ? event.listReminder[3].reminder === 'EVERYDAY' : false) ||
                    (event.listReminder[4] ? event.listReminder[4].reminder === 'EVERYDAY' : false) ||
                    (event.listReminder[5] ? event.listReminder[5].reminder === 'EVERYDAY' : false)
                };
                this.event = event;

                this.needFeedback = event.type === 'SURVEY' ? false : event.needFeedback;

                const startTime = new Date(event.startDate);
                if (startTime.getHours() < 10 && startTime.getMinutes() >= 10) {
                    this.event.startTime = `0${startTime.getHours()}:${startTime.getMinutes()}`;
                }
                if (startTime.getHours() >= 10 && startTime.getMinutes() < 10) {
                    this.event.startTime = `${startTime.getHours()}:0${startTime.getMinutes()}`;
                }
                if (startTime.getMinutes() < 10 && startTime.getHours() < 10) {
                    this.event.startTime = `0${startTime.getHours()}:0${startTime.getMinutes()}`;
                }
                if (startTime.getHours() >= 10 && startTime.getMinutes() >= 10) {
                    this.event.startTime = `${startTime.getHours()}:${startTime.getMinutes()}`;
                }

                const endTime = new Date(event.endDate);
                if (endTime.getHours() < 10 && endTime.getMinutes() >= 10) {
                    this.event.endTime = `0${endTime.getHours()}:${endTime.getMinutes()}`;
                }
                if (endTime.getHours() >= 10 && endTime.getMinutes() < 10) {
                    this.event.endTime = `${endTime.getHours()}:0${endTime.getMinutes()}`;
                }
                if (endTime.getHours() < 10 && endTime.getMinutes() < 10) {
                    this.event.endTime = `0${endTime.getHours()}:0${endTime.getMinutes()}`;
                }
                if (endTime.getHours() >= 10 && endTime.getMinutes() >= 10) {
                    this.event.endTime = `${endTime.getHours()}:${endTime.getMinutes()}`;
                }

                this.viewEventForm.patchValue({
                    ...event,

                    listReminder: event.listReminder.length > 0 ? list : this.viewEventForm.getRawValue().listReminder
                });

            }, error => (this.error = error));
    }

    back(evt: Event): void {
        evt.preventDefault();
        this.location.back();
    }
}
