import {Component, Input, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'fema-cms-tgp-modal-failed-record',
    templateUrl: './tgp-modal-failed-record.component.html',
    styleUrls: ['./tgp-modal-failed-record.component.scss']
})
export class TgpModalFailedRecordComponent {

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    @Output() download: EventEmitter<null>;

    constructor() {

        this.isOpenChange = new EventEmitter<boolean>();

        this.download = new EventEmitter<null>();

    }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

    doDownload(evt: Event): void {

        evt.preventDefault();

        this.download.emit();
        this.closeModal();

    }

}
