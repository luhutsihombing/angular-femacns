import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ContentPopup } from '../../_model/content.model';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'fema-cms-content-view-popup',
  templateUrl: './content-view-popup.component.html',
  styleUrls: ['./content-view-popup.component.scss']
})
export class ContentViewPopupComponent implements OnChanges {
  popupForm: FormGroup;

  @Input() popup: ContentPopup;

  constructor(formBuilder: FormBuilder, private domSanitizer: DomSanitizer) {
    this.popupForm = formBuilder.group({
      active: true,
      description: '',
      idLinkedMenu: '',
      imgLocation: '',
      periodEnd: '',
      periodStart: '',
      title: ''
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.popup && changes.popup.currentValue) {
      this.popupForm.patchValue({
        ...changes.popup.currentValue,
        active: changes.popup.currentValue.active ? 'Yes' : 'No',
        imgLocation: this.domSanitizer.bypassSecurityTrustResourceUrl(changes.popup.currentValue.imgLocation)
      });
    }
  }
}
