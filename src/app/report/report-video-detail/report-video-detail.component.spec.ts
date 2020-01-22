import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoDetailReportSearchComponent } from './video-detail-report-search.component';

describe('VideoDetailReportSearchComponent', () => {
  let component: VideoDetailReportSearchComponent;
  let fixture: ComponentFixture<VideoDetailReportSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [VideoDetailReportSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoDetailReportSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
