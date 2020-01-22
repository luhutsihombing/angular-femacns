import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators, FormArray } from '@angular/forms';
import { Sub } from '../../_model/thinkware.model';

@Component({
  selector: 'fema-cms-thinkware-create-qcc',
  templateUrl: './thinkware-create-qcc.component.html',
  styleUrls: ['./thinkware-create-qcc.component.scss', '../thinkware-create.component.scss']
})
export class ThinkwareCreateQccComponent implements OnInit {

  qualityControlCircle: FormGroup;

  @Output() QCCEmitter: EventEmitter<FormGroup>;
  @Input() uiState;
  @Input() lookup;
  @Input() toolTipQCC;
  @Input() subCategory: Sub[];
  risalah: string;

  set patch(val: boolean) {
    this.subCategory.forEach(subcategory => subcategory.active = val);
  }
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

    this.initialSetup();

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

    this.qualityControlCircle.valueChanges
      .subscribe( () => {
        this.QCCEmitter.emit(this.qualityControlCircle);
      }
    );

  }

  onFocus(id) {
      document.getElementById(id).style.display = 'block';
  }

  onBlur(id) {
      document.getElementById(id).style.display = 'none';
  }


  categorySelected(sub: Sub, active: boolean): void {

    sub.active = active;

    this.qualityControlCircle.get('categoryQCC').patchValue(
      this.subCategory.filter(func => func.active).map(func => func.value).toString()
    );

  }

  initialSetup(): void {

    this.patch = false;

    if (this.subCategory.length === 0) {
      this.qualityControlCircle.get('categoryQCC').clearValidators();
      this.qualityControlCircle.get('categoryQCC').updateValueAndValidity();
    }

    if (this.uiState.proposalQCC) {
      this.qualityControlCircle.enable();
    } else if (!this.uiState.proposalQCC) {
      this.qualityControlCircle.disable();
    }

    this.risalah = this.uiState.proposalQCC.toString();

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
