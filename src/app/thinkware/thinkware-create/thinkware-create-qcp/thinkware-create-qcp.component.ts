import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Sub } from '../../_model/thinkware.model';

@Component({
  selector: 'fema-cms-thinkware-create-qcp',
  templateUrl: './thinkware-create-qcp.component.html',
  styleUrls: ['./thinkware-create-qcp.component.scss', '../thinkware-create.component.scss']
})
export class ThinkwareCreateQcpComponent implements OnInit {
  qualityControlProduction: FormGroup;
  @Output() QCPEmitter: EventEmitter<FormGroup>;
  @Input() uiState;
  @Input() lookup;
  @Input() toolTipQCP;
  @Input() subCategory: Sub[];
  risalah: string;

  set patch(val: boolean) {
    this.subCategory.forEach(subcategory => subcategory.active = val);
  }

  constructor(
    private fb: FormBuilder
  ) {

    this.QCPEmitter = new EventEmitter();

    this.qualityControlProduction = fb.group({
      categoryQCP: ['', Validators.required],
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

    if (this.toolTipQCP) {
      this.toolTipQCP[0].problem ? document.getElementById('ToolProblem').innerHTML = this.toolTipQCP[0].problem :
      document.getElementById('ToolProblem').innerHTML = '';
      this.toolTipQCP[0].goalStatement ? document.getElementById('ToolGoalStatement').innerHTML = this.toolTipQCP[0].goalStatement :
      document.getElementById('ToolGoalStatement').innerHTML = '';
      this.toolTipQCP[0].projectScope ? document.getElementById('ToolProjectScope').innerHTML = this.toolTipQCP[0].projectScope :
      document.getElementById('ToolProjectScope').innerHTML = '';
      this.toolTipQCP[0].processMapping ? document.getElementById('ToolProcessMapping').innerHTML = this.toolTipQCP[0].processMapping :
      document.getElementById('ToolProcessMapping').innerHTML = '';
      this.toolTipQCP[0].performanceMapping ?
      document.getElementById('ToolPerformanceMapping').innerHTML = this.toolTipQCP[0].performanceMapping :
      document.getElementById('ToolPerformanceMapping').innerHTML = '';
      this.toolTipQCP[0].causeAnalysis ? document.getElementById('ToolCauseAnalysis').innerHTML = this.toolTipQCP[0].causeAnalysis :
      document.getElementById('ToolCauseAnalysis').innerHTML = '';
      this.toolTipQCP[0].alternativeSolution ?
      document.getElementById('ToolAlternativeSolution').innerHTML = this.toolTipQCP[0].alternativeSolution :
      document.getElementById('ToolAlternativeSolution').innerHTML = '';
      this.toolTipQCP[0].solution ? document.getElementById('ToolSolution').innerHTML = this.toolTipQCP[0].solution :
      document.getElementById('ToolSolution').innerHTML = '';
      this.toolTipQCP[0].solutionDescription ?
      document.getElementById('ToolSolutionDescription').innerHTML = this.toolTipQCP[0].solutionDescription :
      document.getElementById('ToolSolutionDescription').innerHTML = '';    } else {
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

    this.qualityControlProduction.valueChanges
      .subscribe( () => {
        this.QCPEmitter.emit(this.qualityControlProduction);
      }
    );

  }

  onFocus(id) {
      document.getElementById(id).style.display = 'block';
  }

  onBlur(id) {
      document.getElementById(id).style.display = 'none';
  }


  initialSetup(): void {

    this.patch = false;

    if (this.subCategory.length === 0) {
      this.qualityControlProduction.get('categoryQCP').clearValidators();
      this.qualityControlProduction.get('categoryQCP').updateValueAndValidity();
    }

    if (this.uiState.proposalQCP) {
      this.qualityControlProduction.enable();
    } else if (!this.uiState.proposalQCP) {
      this.qualityControlProduction.disable();
    }

    this.risalah = this.uiState.proposalQCP.toString();
  }

  categorySelected(sub: Sub, active: boolean): void {

    sub.active = active;

    this.qualityControlProduction.get('categoryQCP').patchValue(
      this.subCategory.filter(func => func.active).map(func => func.value).toString()
    );

  }

  invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

    const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.qualityControlProduction.get(control);

    if (errorType) {

        return ctrl.hasError(errorType)
            ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

    }

    return ctrl.invalid && this.uiState.saveIsPressed;

}

}
