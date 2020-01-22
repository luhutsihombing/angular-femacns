import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';


@Component({
  selector: 'fema-cms-thinkware-create-ss',
  templateUrl: './thinkware-create-ss.component.html',
  styleUrls: ['./thinkware-create-ss.component.scss', '../thinkware-create.component.scss']
})

export class ThinkwareCreateSsComponent implements OnInit {

  suggestSystem: FormGroup;
  @Output() SSEmitter: EventEmitter<FormGroup>;
  @Input() resourcePath;
  @Input() uiState;
  @Input() lookup;
  @Input() toolTipSS;

  imgLocation;

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

    this.initialSetup();

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

    this.suggestSystem.valueChanges
      .subscribe(() => {
        this.SSEmitter.emit(this.suggestSystem);
      }
    );

  }

  onFocus(id) {
      document.getElementById(id).style.display = 'block';
  }

  onBlur(id) {
      document.getElementById(id).style.display = 'none';
  }

  checkFormValidity() {
    if (this.suggestSystem.valid === true) {
      return true;
    }
    return false;
  }

  initialSetup(): void {
    if (this.uiState.proposalSS) {
      this.suggestSystem.enable();
    } else if (!this.uiState.proposalSS) {
      this.suggestSystem.disable();
    }
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
