import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'fema-cms-thinkware-create-ii',
  templateUrl: './thinkware-create-ii.component.html',
  styleUrls: ['./thinkware-create-ii.component.scss', '../thinkware-create.component.scss']
})
export class ThinkwareCreateIiComponent implements OnInit {
  innovationIdea: FormGroup;
  @Output() IIEmitter: EventEmitter<FormGroup>;
  @Input() uiState;
  @Input() lookup;
  @Input() toolTipII;
  @Input() subCategory;

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

    this.initialSetup();

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

    this.innovationIdea.valueChanges
      .subscribe(() => {
        this.IIEmitter.emit(this.innovationIdea);
      }
    );

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

  initialSetup(): void {
    if (this.subCategory.length === 1) {
      this.innovationIdea.get('categoryII').clearValidators();
      this.innovationIdea.get('categoryII').updateValueAndValidity();
    }

    if (this.uiState.proposalII) {
      this.innovationIdea.enable();
    } else if (!this.uiState.proposalII) {
      this.innovationIdea.disable();
    }
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
