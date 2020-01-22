import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'fema-cms-modal-search',
    templateUrl: './modal-search.component.html',
    styleUrls: ['./modal-search.component.scss']
})
export class ModalSearchComponent implements OnInit {

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;
    @Input() bahasa?: string;

    @Output() search: EventEmitter<null>;

    constructor() {

        this.isOpenChange = new EventEmitter<boolean>();
        this.search = new EventEmitter<null>();

    }

    ngOnInit() { }

    closeModal(evt?: Event): void {

        if (evt) {
            evt.preventDefault();
        }

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);

    }

    doSearch(evt: Event): void {

        evt.preventDefault();

        this.search.emit();
        this.closeModal();

    }

}
