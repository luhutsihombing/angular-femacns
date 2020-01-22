import {Counterpart} from '../_model/counterpart.model';
import {Component, EventEmitter, Input, Output, SimpleChanges, OnChanges} from '@angular/core';
import {CounterpartService} from '../_service/counterpart.service';
import {ActionResponse} from '../../../_model/app.model';

@Component({
    selector: 'fema-cms-counterpart-modal-view-area',
    templateUrl: './counterpart-modal-view-area.component.html',
    styleUrls: ['./counterpart-modal-view-area.component.scss']
})
export class CounterpartModalViewAreaComponent implements OnChanges {

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    @Input() counterpartId: string;

    counterpart: Counterpart;

    responseOnAction: ActionResponse;

    constructor(
        private cpSvc: CounterpartService
    ) {

        this.isOpenChange = new EventEmitter<boolean>();

    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes.counterpartId && changes.counterpartId.currentValue) {

            this.responseOnAction = null;

            this.cpSvc.getById(changes.counterpartId.currentValue)
                .subscribe(
                    counterpart => this.counterpart = counterpart,
                    error => this.responseOnAction = {...error, type: 'ErrorResponse'}
                );

        }

    }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

}
