import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'fema-cms-tgp-modal-process',
    templateUrl: './tgp-modal-process.component.html',
    styleUrls: ['./tgp-modal-process.component.scss'],
})
export class TgpModalProcessComponent {

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    @Output() process: EventEmitter<null>;

    constructor() {

        this.isOpenChange = new EventEmitter<boolean>();

        this.process = new EventEmitter<null>();

    }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

    doProcess(evt: Event): void {

        evt.preventDefault();

        this.process.emit();
        this.closeModal();

    }

}
