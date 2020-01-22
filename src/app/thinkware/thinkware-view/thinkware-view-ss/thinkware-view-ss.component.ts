import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Thinkware } from '../../_model/thinkware.model';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { REGEX_FILE_NAME } from '../../../_const/regex.const';

@Component({
  selector: 'fema-cms-thinkware-view-ss',
  templateUrl: './thinkware-view-ss.component.html',
  styleUrls: ['../thinkware-view.component.scss']
})
export class ThinkwareViewSsComponent implements OnInit {

  @Input() ss: Thinkware;
  @Input() isDisable: boolean;
  ssForm: FormGroup;

  tipe: string[];
  attachment: FormGroup;

  constructor(private fb: FormBuilder
  ) {

     this.ssForm = fb.group({
       problem : [{value: '', disabled: true}],
       cause : [{value: '', disabled: true}],
       solution : [{value: '', disabled: true}],
       attachment : ''
    });

    this.attachment = fb.group({});
    this.tipe = [];
  }

  ngOnInit() {

    this.isDisable ? this.ssForm.disable() : this.ssForm.enable();
    this.ssForm.patchValue(this.ss.detailSS);

    for (let index = 0; index < this.ssForm.get('attachment').value.length; index++) {
      const checkType = this.ssForm.get('attachment').value[index].type;

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

    for (let index = 0; index < this.ssForm.get('attachment').value.length; index++) {
      const tambah =  REGEX_FILE_NAME.exec(this.ssForm.get('attachment').value[index].fullPath)[0];
      const full = this.ssForm.get('attachment').value[index].fullPath;
      const checkType = this.ssForm.get('attachment').value[index].type;

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

}
