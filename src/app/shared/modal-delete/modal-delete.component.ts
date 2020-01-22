import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fema-cms-modal-delete',
  templateUrl: './modal-delete.component.html',
  styleUrls: ['./modal-delete.component.scss']
})
export class ModalDeleteComponent implements OnInit {
  @Input() isOpen: boolean;
  @Input() isOpenSuccess: boolean;
  @Input() bahasa?: string;
  @Input() returnLink: string;

  @Output() isOpenChange: EventEmitter<boolean>;

  @Output() delete: EventEmitter<null>;

  constructor() {
    this.isOpen = false;
    this.isOpenChange = new EventEmitter<boolean>();

    this.delete = new EventEmitter<null>();
  }

  ngOnInit() {}

  closeModal(evt?: Event): void {
    if (evt) {
      evt.preventDefault();
    }

    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  deleteAction(evt: Event): void {
    evt.preventDefault();

    this.delete.emit();
    this.closeModal();
  }
}
