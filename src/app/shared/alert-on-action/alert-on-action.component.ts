import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActionResponse, ErrorResponse} from '../../_model/app.model';

@Component({
    selector: 'fema-cms-alert-on-action',
    templateUrl: './alert-on-action.component.html',
    styleUrls: ['./alert-on-action.component.scss']
})
export class AlertOnActionComponent {

    @Input() errorOnInit: ErrorResponse;
    @Input() responseOnAction: ActionResponse;
    @Input() isLoading: boolean;
    @Input() isFailed: boolean;

    @Output() retry: EventEmitter<null>;
    @Output() close: EventEmitter<ActionResponse>;

    constructor() {

        this.retry = new EventEmitter();
        this.close = new EventEmitter();

    }

    loadingState(): boolean {

        return this.isLoading && !this.errorOnInit;

    }

    failedState(): boolean {

        return this.errorOnInit && this.isFailed;

    }

    retryOnFailure(evt: Event): void {

        evt.preventDefault();

        this.retry.emit();

    }

    closeResponseOnAction(): void {

        this.responseOnAction = undefined;
        this.close.emit(this.responseOnAction);

    }

}
