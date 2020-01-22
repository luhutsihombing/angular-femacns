import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertInvalidFormComponent } from './alert-invalid-form.component';

describe('AlertInvalidFormComponent', () => {
  let component: AlertInvalidFormComponent;
  let fixture: ComponentFixture<AlertInvalidFormComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AlertInvalidFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertInvalidFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
