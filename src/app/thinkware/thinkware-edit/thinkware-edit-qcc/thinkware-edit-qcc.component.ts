import { Component, OnInit, EventEmitter, Output, Input, DoCheck } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Thinkware, Sub } from '../../_model/thinkware.model';

@Component({
  selector: 'fema-cms-thinkware-edit-qcc',
  templateUrl: './thinkware-edit-qcc.component.html',
  styleUrls: ['./thinkware-edit-qcc.component.scss', '../thinkware-edit.component.scss']
})
export class ThinkwareEditQccComponent implements OnInit, DoCheck {

  @Output() QCCEmitter: EventEmitter<FormGroup>;
  @Input() qcc: Thinkware;
  @Input() subCategory;
  @Input() uiState;
  @Input() lookup;
  @Input() toolTipQCC;

  split: Array<any>;
  check: Array<boolean> = [];

  set patch(val: boolean) {
    this.subCategory.forEach(subcategory => subcategory.active = val);
  }


  qualityControlCircle: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {

    this.QCCEmitter = new EventEmitter();

    this.qualityControlCircle = fb.group({
      categoryQCC: ['', Validators.required],
      problem: ['', Validators.required],
      goalStatement: ['', Validators.required],
      projectScope: ['', Validators.required],
      processMapping: ['', Validators.required],
      performanceMapping: ['', Validators.required],
      causeAnalysis: ['', Validators.required],
      alternativeSolution: ['', Validators.required],
      solution: ['', Validators.required],
      solutionDescription: ['', Validators.required]
    });
  }

  ngOnInit() {

    if (this.toolTipQCC) {
      this.toolTipQCC[0].problem ? document.getElementById('ToolProblem').innerHTML = this.toolTipQCC[0].problem :
      document.getElementById('ToolProblem').innerHTML = '';
      this.toolTipQCC[0].goalStatement ? document.getElementById('ToolGoalStatement').innerHTML = this.toolTipQCC[0].goalStatement :
      document.getElementById('ToolGoalStatement').innerHTML = '';
      this.toolTipQCC[0].projectScope ? document.getElementById('ToolProjectScope').innerHTML = this.toolTipQCC[0].projectScope :
      document.getElementById('ToolProjectScope').innerHTML = '';
      this.toolTipQCC[0].processMapping ? document.getElementById('ToolProcessMapping').innerHTML = this.toolTipQCC[0].processMapping :
      document.getElementById('ToolProcessMapping').innerHTML = '';
      this.toolTipQCC[0].performanceMapping ?
      document.getElementById('ToolPerformanceMapping').innerHTML = this.toolTipQCC[0].performanceMapping :
      document.getElementById('ToolPerformanceMapping').innerHTML = '';
      this.toolTipQCC[0].causeAnalysis ? document.getElementById('ToolCauseAnalysis').innerHTML = this.toolTipQCC[0].causeAnalysis :
      document.getElementById('ToolCauseAnalysis').innerHTML = '';
      this.toolTipQCC[0].alternativeSolution ?
      document.getElementById('ToolAlternativeSolution').innerHTML = this.toolTipQCC[0].alternativeSolution :
      document.getElementById('ToolAlternativeSolution').innerHTML = '';
      this.toolTipQCC[0].solution ? document.getElementById('ToolSolution').innerHTML = this.toolTipQCC[0].solution :
      document.getElementById('ToolSolution').innerHTML = '';
      this.toolTipQCC[0].solutionDescription ?
      document.getElementById('ToolSolutionDescription').innerHTML = this.toolTipQCC[0].solutionDescription :
      document.getElementById('ToolSolutionDescription').innerHTML = '';
    } else {
      document.getElementById('ToolProblem').innerHTML = '';
      document.getElementById('ToolGoalStatement').innerHTML = '';
      document.getElementById('ToolProjectScope').innerHTML = '';
      document.getElementById('ToolProcessMapping').innerHTML = '';
      document.getElementById('ToolPerformanceMapping').innerHTML = '';
      document.getElementById('ToolCauseAnalysis').innerHTML = '';
      document.getElementById('ToolAlternativeSolution').innerHTML = '';
      document.getElementById('ToolSolution').innerHTML = '';
      document.getElementById('ToolSolutionDescription').innerHTML = '';
    }

    if (this.subCategory.length === 0) {
      this.qualityControlCircle.get('categoryQCC').clearValidators();
      this.qualityControlCircle.get('categoryQCC').updateValueAndValidity();
    }

    this.patch = false;

    if (this.qcc.detailQCC) {
      this.qualityControlCircle.patchValue(this.qcc.detailQCC ? this.qcc.detailQCC : null);

      for (let index = 0; index < this.subCategory.length; index++) {
        if (this.subCategory[index].label === this.qcc.detailQCC.categoryQCC)   {
          this.qualityControlCircle.get('categoryQCC').setValue(this.subCategory[index].value);
        }
      }
    }

    const category = this.qualityControlCircle.get('categoryQCC').value;
    this.split = category.split(',');

    this.qualityControlCircle.valueChanges
      .subscribe( () => {
        this.QCCEmitter.emit(this.qualityControlCircle);
      }
    );

    if (this.uiState.proposalQCC === 'true') {
        this.qualityControlCircle.enable();
      } else if (this.uiState.proposalQCC === 'false') {
        this.qualityControlCircle.disable();
      }

  }

  onFocus(id) {
      document.getElementById(id).style.display = 'block';
  }

  onBlur(id) {
      document.getElementById(id).style.display = 'none';
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

  categorySelected(sub: Sub, active: boolean): void {

    sub.active = active;

      this.qualityControlCircle.get('categoryQCC').patchValue(
        this.subCategory.filter(func => func.active).map(func => func.value).toString()
      );
}
  invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

    const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.qualityControlCircle.get(control);

    if (errorType) {

        return ctrl.hasError(errorType)
            ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

    }

    return ctrl.invalid && this.uiState.saveIsPressed;

  }

}
