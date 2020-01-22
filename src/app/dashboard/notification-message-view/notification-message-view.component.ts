import {Component, OnInit, ElementRef, ViewChild, AfterViewChecked} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DashboardService} from '../_service/dashboard.service';
import {switchMap} from 'rxjs/operators';
import {Location} from '@angular/common';
import {NotificationMessage} from '../_model/dashboard.model';
import {ErrorResponse} from '../../_model/app.model';

@Component({
    selector: 'fema-cms-notification-message-view',
    templateUrl: './notification-message-view.component.html',
    styleUrls: ['./notification-message-view.component.scss']
})
export class NotificationMessageViewComponent implements OnInit, AfterViewChecked {

    @ViewChild('domNotificationMessageBody') domNotificationMessageBody: ElementRef;
    notificationMessage: NotificationMessage;

    errorOnInit: ErrorResponse;

    constructor(
        private ar: ActivatedRoute,
        private loc: Location,
        private dashboardSvc: DashboardService
    ) {
    }

    ngOnInit() {

        this.initialSetup();

    }

    initialSetup(): void {

        this.ar.params
            .pipe(switchMap(params =>
                this.dashboardSvc.getNotificationDetail(params.id)))
            .subscribe(
                notificationMessage => this.notificationMessage = notificationMessage,
                error => this.errorOnInit = {...error, type: 'ErrorResponse'}
            );

    }

    ngAfterViewChecked() {

        if (this.domNotificationMessageBody && this.domNotificationMessageBody.nativeElement) {
            this.domNotificationMessageBody.nativeElement.innerHTML = this.notificationMessage.body;
        }

    }

    back(evt: Event): void {

        evt.preventDefault();

        this.loc.back();

    }

}
