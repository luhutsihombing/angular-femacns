import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSummaryReportSearchComponent } from './video-summary-report-search.component';

describe('VideoSummaryReportSearchComponent', () => {
  let component: VideoSummaryReportSearchComponent;
  let fixture: ComponentFixture<VideoSummaryReportSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [VideoSummaryReportSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSummaryReportSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
