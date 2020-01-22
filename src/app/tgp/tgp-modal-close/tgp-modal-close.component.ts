import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'fema-cms-tgp-modal-close',
    templateUrl: './tgp-modal-close.component.html',
    styleUrls: ['./tgp-modal-close.component.scss'],
})
export class TgpModalCloseComponent {

    @Input() returnLink: string;

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    @Input() isOpenSuccess: boolean;
    @Output() isOpenSuccessChange: EventEmitter<boolean>;

    @Output() close: EventEmitter<null>;

    constructor() {

        this.returnLink = '';

        this.isOpenChange = new EventEmitter<boolean>();

        this.isOpenSuccessChange = new EventEmitter<boolean>();

        this.close = new EventEmitter<null>();

    }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

    doClose(evt: Event): void {

        evt.preventDefault();

        this.close.emit();
        this.closeModal();

    }

}
