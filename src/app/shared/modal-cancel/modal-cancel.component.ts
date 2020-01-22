import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'fema-cms-modal-cancel',
    templateUrl: './modal-cancel.component.html',
    styleUrls: ['./modal-cancel.component.scss']
})
export class ModalCancelComponent {
    @Input() returnLink: string;
    @Input() bahasa?: string;
    @Input() modul?: string;
    @Input() backward?: string;

    @Input() isOpen: boolean;
    @Output() isOpenChange: EventEmitter<boolean>;

    constructor(private router: Router, private location: Location) {
        this.returnLink = '/dashboard';

        this.isOpen = true;
        this.isOpenChange = new EventEmitter<boolean>();
    }

    closeModal(evt: Event): void {
        evt.preventDefault();

        this.isOpen = false;
        this.isOpenChange.emit(this.isOpen);
    }

    back(evt: Event): void {
        evt.preventDefault();
        if(this.backward) {
            this.location.back();
        } else {
            this.router.navigate([this.returnLink]);
        }
    }
}
