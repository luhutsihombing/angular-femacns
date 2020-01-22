import { Component, OnInit, Output, EventEmitter, Input, DoCheck } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Thinkware, Sub } from '../../_model/thinkware.model';

@Component({
  selector: 'fema-cms-thinkware-edit-qcp',
  templateUrl: './thinkware-edit-qcp.component.html',
  styleUrls: ['./thinkware-edit-qcp.component.scss', '../thinkware-edit.component.scss']
})
export class ThinkwareEditQcpComponent implements OnInit, DoCheck {

  @Output() QCPEmitter: EventEmitter<FormGroup>;
  @Input() qcp: Thinkware;
  @Input() uiState;
  @Input() uiStateQcp;
  @Input() subCategory: Sub[];
  @Input() lookup;
  @Input() toolTipQCP;

  split: Array<any>;
  check: Array<boolean> = [];

  set patch(val: boolean) {
    this.subCategory.forEach(subcategory => subcategory.active = val);
  }

  qualityControlProduction: FormGroup;
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

    if (this.subCategory.length === 0) {
      this.qualityControlProduction.get('categoryQCP').clearValidators();
      this.qualityControlProduction.get('categoryQCP').updateValueAndValidity();
    }

    this.patch = false;

    if (this.qcp.detailQCP) {
      this.qualityControlProduction.patchValue(this.qcp.detailQCP ? this.qcp.detailQCP : null);

      for (let index = 0; index < this.subCategory.length; index++) {
        if (this.subCategory[index].label === this.qcp.detailQCP.categoryQCP)   {
          this.qualityControlProduction.get('categoryQCP').setValue(this.subCategory[index].value);
        }
      }
    }

    const category = this.qualityControlProduction.get('categoryQCP').value;
    this.split = category.split(',');

    this.qualityControlProduction.valueChanges
      .subscribe( () => {
        this.QCPEmitter.emit(this.qualityControlProduction);
      }
    );

    if (this.uiState.proposalQCP === 'true') {
      this.qualityControlProduction.enable();
    } else if (this.uiState.proposalQCP === 'false') {
      this.qualityControlProduction.disable();
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
