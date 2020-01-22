import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibilityViewComponent } from './responsibility-view.component';

describe('ResponsibilityViewComponent', () => {
  let component: ResponsibilityViewComponent;
  let fixture: ComponentFixture<ResponsibilityViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ResponsibilityViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibilityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
