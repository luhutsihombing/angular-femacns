import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertOnActionComponent } from './alert-on-action.component';

describe('AlertOnActionComponent', () => {
  let component: AlertOnActionComponent;
  let fixture: ComponentFixture<AlertOnActionComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AlertOnActionComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertOnActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
