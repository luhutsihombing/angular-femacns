import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'fema-cms-alert-invalid-form',
  templateUrl: './alert-invalid-form.component.html',
  styleUrls: ['./alert-invalid-form.component.scss']
})
export class AlertInvalidFormComponent implements OnInit {
  @Input() invalid: boolean;
  @Input() responseInvalidForm: any;

  constructor() {}

  ngOnInit() {}
}
