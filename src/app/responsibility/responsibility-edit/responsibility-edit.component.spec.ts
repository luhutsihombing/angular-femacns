import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibilityEditComponent } from './responsibility-edit.component';

describe('ResponsibilityEditComponent', () => {
  let component: ResponsibilityEditComponent;
  let fixture: ComponentFixture<ResponsibilityEditComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ResponsibilityEditComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibilityEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
