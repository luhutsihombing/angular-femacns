import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
    selector: 'fema-cms-modal-save',
    templateUrl: './modal-save.component.html',
    styleUrls: ['./modal-save.component.scss']
})
export class ModalSaveComponent implements OnInit {

    @Input() isOpenSuccess: boolean;
    @Input() returnLink: string;
    @Input() bahasa?;

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    @Output() save: EventEmitter<null>;

    constructor() {

        this.isOpenChange = new EventEmitter<boolean>();
        this.save = new EventEmitter<null>();
    }

    ngOnInit() {
        
    }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

    saveAction(evt: Event): void {

        evt.preventDefault();

        this.save.emit();
        this.closeModal();

    }
}
