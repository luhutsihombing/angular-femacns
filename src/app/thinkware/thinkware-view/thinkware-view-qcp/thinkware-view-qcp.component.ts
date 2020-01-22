import { Component, OnInit, Input, DoCheck} from '@angular/core';
import { Thinkware } from '../../_model/thinkware.model';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { REGEX_FILE_NAME } from '../../../_const/regex.const';

@Component({
  selector: 'fema-cms-thinkware-view-qcp',
  templateUrl: './thinkware-view-qcp.component.html',
  styleUrls: ['./thinkware-view-qcp.component.scss']
})
export class ThinkwareViewQcpComponent implements OnInit, DoCheck {

  @Input() qcp: Thinkware;
  @Input() isDisable: boolean;
  @Input() subCategory;

  split: Array<any>;
  check: Array<boolean> = [];
  qcpForm: FormGroup;

  tipe: string[];
  attachment: FormGroup;

  constructor(private fb: FormBuilder
  ) {this.qcpForm = fb.group({
    categoryQCP: [''],
    problem: [''],
    goalStatement: [''],
    projectScope: [''],
    processMapping: [''],
    performanceMapping: [''],
    causeAnalysis: [''],
    alternativeSolution: [''],
    solution: [''],
    solutionDescription: [''],
    attachment: ''
  });

  this.attachment = fb.group({});
  this.tipe = [];
}

  ngOnInit() {

    this.isDisable ? this.qcpForm.disable() : this.qcpForm.enable();
    this.qcpForm.patchValue(this.qcp.detailQCP);

    const category = this.qcpForm.get('categoryQCP').value;
    this.split = category.split(',');

    for (let index = 0; index < this.qcpForm.get('attachment').value.length; index++) {
      const checkType = this.qcpForm.get('attachment').value[index].type;

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

    for (let index = 0; index < this.qcpForm.get('attachment').value.length; index++) {
      const tambah =  REGEX_FILE_NAME.exec(this.qcpForm.get('attachment').value[index].fullPath)[0];
      const full = this.qcpForm.get('attachment').value[index].fullPath;
      const checkType = this.qcpForm.get('attachment').value[index].type;

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

  ngDoCheck() {
    for (let index = 0; index < this.subCategory.length; index++) {
      for (let i = 0; i <  this.split.length; i++) {
         if (this.split[i] === this.subCategory[index].value) {
          this.check.push(true);
         }
      }
      if (this.check[index] === undefined) {
        this.check.push(false);
      }
    }
  }

  categorySelected(event) {
    this.qcpForm.get('categoryQCP').setValue(event);
  }
}
