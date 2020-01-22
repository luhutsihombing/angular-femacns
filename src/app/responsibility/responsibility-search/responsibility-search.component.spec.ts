import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibilitySearchComponent } from './responsibility-search.component';

describe('ResponsibilitySearchComponent', () => {
  let component: ResponsibilitySearchComponent;
  let fixture: ComponentFixture<ResponsibilitySearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ResponsibilitySearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibilitySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
