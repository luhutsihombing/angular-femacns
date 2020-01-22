import {Component, Input, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'fema-cms-feedback-modal-delete-category',
    templateUrl: './feedback-modal-delete-category.component.html',
})
export class FeedbackModalDeleteCategoryComponent {

    @Input() returnLink: string;

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    @Input() isOpenSuccess: boolean;
    @Output() isOpenSuccessChange: EventEmitter<boolean>;

    @Output() action: EventEmitter<void>;

    constructor() {

        this.returnLink = '';

        this.isOpenChange = new EventEmitter<boolean>();

        this.isOpenSuccessChange = new EventEmitter<boolean>();

        this.action = new EventEmitter<void>();

    }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

    doAction(evt: Event): void {

        evt.preventDefault();

        this.action.emit();
        this.closeModal();

    }

}
