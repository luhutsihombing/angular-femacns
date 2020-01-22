import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportFeedbackComponent } from './report-feedback.component';

describe('ReportNewsDetailComponent', () => {
  let component: ReportFeedbackComponent;
  let fixture: ComponentFixture<ReportFeedbackComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ReportFeedbackComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
