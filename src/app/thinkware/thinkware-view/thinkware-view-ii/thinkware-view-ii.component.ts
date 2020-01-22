import { Component, OnInit, Input } from '@angular/core';
import { Thinkware } from '../../_model/thinkware.model';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { REGEX_FILE_NAME } from '../../../_const/regex.const';

@Component({
  selector: 'fema-cms-thinkware-view-ii',
  templateUrl: './thinkware-view-ii.component.html',
  styleUrls: ['./thinkware-view-ii.component.scss']
})
export class ThinkwareViewIiComponent implements OnInit {

  @Input() ii: Thinkware;
  @Input() isDisable: boolean;
  @Input() subCategory;
  iiForm: FormGroup;

  tipe: string[];
  attachment: FormGroup;

  constructor(private fb: FormBuilder
  ) {
    this.iiForm = fb.group({
      categoryII: [''],
      businessCase: [''],
      description: [''],
      costAndBenefit: [''],
      attachment: ''
    });
    this.attachment = fb.group({});
    this.tipe = [];
   }

  ngOnInit() {
    this.isDisable ? this.iiForm.disable() : this.iiForm.enable();
    this.iiForm.patchValue(this.ii.detailII);

    for (let index = 0; index < this.iiForm.get('attachment').value.length; index++) {
      const checkType = this.iiForm.get('attachment').value[index].type;

      // mengisi array tipe
      let ada = false;
      for (let indexTipe = 0; indexTipe < this.tipe.length; indexTipe++) {
        if (checkType === this.tipe[indexTipe]) {
          ada = ada || true;
        }
      }
      if (!ada) {
        this.tipe.push(checkType);
      }
      // akhir mengisi array tipe
    }

    // membuat formArray
    for (let index = 0; index < this.tipe.length; index++) {
      const existAttachmentForms = this.fb.array([]);
      const exist = this.fb.group({});
      existAttachmentForms.push(exist);
      this.attachment.addControl('attachment' + this.toTitleCase(this.tipe[index]), existAttachmentForms);
    }
    // akhir membuat firmArray

    for (let index = 0; index < this.iiForm.get('attachment').value.length; index++) {
      const tambah =  REGEX_FILE_NAME.exec(this.iiForm.get('attachment').value[index].fullPath)[0];
      const full = this.iiForm.get('attachment').value[index].fullPath;
      const checkType = this.iiForm.get('attachment').value[index].type;

      // mengisi exist attachment
      const arrayForm = this.attachment.get('attachment' + this.toTitleCase(checkType)) as FormArray;
      const exist = this.fb.group({
        fileName: [tambah],
        fullPath: [full]
      });
      arrayForm.push(exist);
      this.attachment.get('attachment' + this.toTitleCase(checkType)).setValue(arrayForm.value);
      // akhir exist attachment
    }

  }

  toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
  }

  categorySelected(event) {
    this.iiForm.get('categoryII').setValue(event);
  }

}
