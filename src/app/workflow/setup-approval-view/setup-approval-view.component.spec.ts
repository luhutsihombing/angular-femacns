import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalViewComponent } from './setup-approval-view.component';

describe('counterpartSearchComponent', () => {
  let component: ApprovalViewComponent;
  let fixture: ComponentFixture<ApprovalViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ApprovalViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
