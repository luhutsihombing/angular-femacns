import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Thinkware } from '../../_model/thinkware.model';

@Component({
  selector: 'fema-cms-thinkware-edit-ss',
  templateUrl: './thinkware-edit-ss.component.html',
  styleUrls: ['./thinkware-edit-ss.component.scss', '../thinkware-edit.component.scss']
})
export class ThinkwareEditSsComponent implements OnInit {

  @Output() SSEmitter: EventEmitter<FormGroup>;
  @Input() ss: Thinkware;
  @Input() uiState;
  @Input() lookup;
  @Input() toolTipSS;

  suggestSystem: FormGroup;
  constructor(
    private fb: FormBuilder,
  ) {

    this.SSEmitter = new EventEmitter();

    this.suggestSystem = fb.group({
      cause: ['', Validators.required],
      problem: ['', Validators.required],
      solution: ['', Validators.required]
    });
  }

  ngOnInit() {

    if (this.toolTipSS) {
      this.toolTipSS[0].problem ? document.getElementById('ToolProblem').innerHTML = this.toolTipSS[0].problem
      : document.getElementById('ToolProblem').innerHTML = '';
      this.toolTipSS[0].cause ? document.getElementById('ToolCause').innerHTML = this.toolTipSS[0].cause
      : document.getElementById('ToolCause').innerHTML = '';
      this.toolTipSS[0].solution ? document.getElementById('ToolSolution').innerHTML = this.toolTipSS[0].solution
      : document.getElementById('ToolSolution').innerHTML = '';
    } else {
      document.getElementById('ToolProblem').innerHTML = '';
      document.getElementById('ToolCause').innerHTML = '';
      document.getElementById('ToolSolution').innerHTML = '';
    }

    if (this.ss.detailSS) {
    this.suggestSystem.patchValue(this.ss.detailSS ? this.ss.detailSS : null);
    }

    this.suggestSystem.valueChanges
      .subscribe(() => {
        this.SSEmitter.emit(this.suggestSystem);
      }
    );

    if (this.uiState.proposalSS === 'true') {
      this.suggestSystem.enable();
    } else if (this.uiState.proposalSS === 'false') {
      this.suggestSystem.disable();
    }


  }

  onFocus(id) {
      document.getElementById(id).style.display = 'block';
  }

  onBlur(id) {
      document.getElementById(id).style.display = 'none';
  }
  invalidField(control: AbstractControl | string | string[], errorType?: string): boolean {

    const ctrl: AbstractControl = control instanceof AbstractControl ? control : this.suggestSystem.get(control);

    if (errorType) {

        return ctrl.hasError(errorType)
            ? ctrl.getError(errorType) && this.uiState.saveIsPressed : false;

    }

    return ctrl.invalid && this.uiState.saveIsPressed;

  }

}
