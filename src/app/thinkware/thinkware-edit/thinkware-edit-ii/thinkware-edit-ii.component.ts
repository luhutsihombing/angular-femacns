import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Thinkware } from '../../_model/thinkware.model';

@Component({
    selector: 'fema-cms-thinkware-edit-ii',
    templateUrl: './thinkware-edit-ii.component.html',
    styleUrls: ['./thinkware-edit-ii.component.scss', '../thinkware-edit.component.scss']
})
export class ThinkwareEditIiComponent implements OnInit {
  @Output() IIEmitter: EventEmitter<FormGroup>;
  @Input() uiState;
  @Input() lookup;
  @Input() subCategory;
  @Input() ii: Thinkware;
  @Input() toolTipII;

  innovationIdea: FormGroup;
  constructor(
    private fb: FormBuilder
  ) {

    this.IIEmitter = new EventEmitter();

    this.innovationIdea = fb.group({
      categoryII: ['', Validators.required],
      businessCase: ['', Validators.required],
      description: ['', Validators.required],
      costAndBenefit: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.subCategory.length === 1) {
      this.innovationIdea.get('categoryII').clearValidators();
      this.innovationIdea.get('categoryII').updateValueAndValidity();
    }

    if (this.toolTipII) {
      this.toolTipII[0].businessCase ? document.getElementById('ToolBusinessCase').innerHTML = this.toolTipII[0].businessCase :
      document.getElementById('ToolBusinessCase').innerHTML = '';
      this.toolTipII[0].description ? document.getElementById('ToolDescription').innerHTML = this.toolTipII[0].description :
      document.getElementById('ToolDescription').innerHTML = '';
      this.toolTipII[0].costAndBenefit ? document.getElementById('ToolCostAndBenefit').innerHTML = this.toolTipII[0].costAndBenefit :
      document.getElementById('ToolCostAndBenefit').innerHTML = '';
    } else {
      document.getElementById('ToolBusinessCase').innerHTML = '';
      document.getElementById('ToolDescription').innerHTML = '';
      document.getElementById('ToolCostAndBenefit').innerHTML = '';
    }

    if (this.ii.detailII) {
      this.innovationIdea.patchValue(this.ii.detailII ? this.ii.detailII : null);

      for (let index = 0; index < this.subCategory.length; index++) {
        if (this.subCategory[index].label === this.ii.detailII.categoryII)   {
          this.innovationIdea.get('categoryII').setValue(this.subCategory[index].value);
        }
      }
    }

    this.innovationIdea.valueChanges
      .subscribe(() => {
        this.IIEmitter.emit(this.innovationIdea);
      }
    );

    if (this.uiState.proposalII === 'true') {
      this.innovationIdea.enable();
    } else if (this.uiState.proposalII === 'false') {
      this.innovationIdea.disable();
    }


  }

  onFocus(id) {
      document.getElementById(id).style.display = 'block';
  }

  onBlur(id) {
      document.getElementById(id).style.display = 'none';
  }

  categorySelected(event) {
    this.innovationIdea.get('categoryII').setValue(event);
  }

  invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

    const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.innovationIdea.get(control);

    if (errorType) {

        return ctrl.hasError(errorType)
            ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;
      }

    return ctrl.invalid && this.uiState.saveIsPressed;

  }

}
