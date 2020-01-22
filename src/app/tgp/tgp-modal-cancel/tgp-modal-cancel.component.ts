import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'fema-cms-tgp-modal-cancel',
    templateUrl: './tgp-modal-cancel.component.html',
    styleUrls: ['./tgp-modal-cancel.component.scss'],
})
export class TgpModalCancelComponent {

    @Input() returnLink: string;

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    @Input() isOpenSuccess: boolean;
    @Output() isOpenSuccessChange: EventEmitter<boolean>;

    @Output() cancel: EventEmitter<null>;

    constructor() {

        this.returnLink = '';

        this.isOpenChange = new EventEmitter<boolean>();

        this.isOpenSuccessChange = new EventEmitter<boolean>();

        this.cancel = new EventEmitter<null>();

    }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

    doCancel(evt: Event): void {

        evt.preventDefault();

        this.cancel.emit();
        this.closeModal();

    }

}
