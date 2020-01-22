import { DomSanitizer } from '@angular/platform-browser';
import { ContentBanner } from '../../_model/content.model';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'fema-cms-content-view-banner',
  templateUrl: './content-view-banner.component.html',
  styleUrls: ['./content-view-banner.component.scss']
})
export class ContentViewBannerComponent implements OnChanges {
  bannerForm: FormGroup;

  @Input() banner: ContentBanner;

  constructor(formBuilder: FormBuilder, private domSanitizer: DomSanitizer) {
    this.bannerForm = formBuilder.group({
      active: true,
      defaultBanner: false,
      description: '',
      idLinkedMenu: '',
      imgLocation: '',
      periodEnd: '',
      periodStart: '',
      title: ''
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.banner && changes.banner.currentValue) {
      this.bannerForm.patchValue({
        ...changes.banner.currentValue,
        active: changes.banner.currentValue.active ? 'Yes' : 'No',
        defaultBanner: changes.banner.currentValue.defaultBanner ? 'Yes' : 'No',
        imgLocation: this.domSanitizer.bypassSecurityTrustResourceUrl(changes.banner.currentValue.imgLocation)
      });
    }
  }
}
