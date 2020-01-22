import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibilityCreateComponent } from './responsibility-create.component';

describe('ResponsibilityCreateComponent', () => {
  let component: ResponsibilityCreateComponent;
  let fixture: ComponentFixture<ResponsibilityCreateComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ResponsibilityCreateComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibilityCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
