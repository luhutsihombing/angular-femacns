import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentSearchComponent } from './assignment-search.component';

describe('AssignmentSearchComponent', () => {
  let component: AssignmentSearchComponent;
  let fixture: ComponentFixture<AssignmentSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AssignmentSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
