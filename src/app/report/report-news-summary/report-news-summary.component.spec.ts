import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportNewsSummaryComponent } from './report-news-summary.component';

describe('ReportNewsSummaryComponent', () => {
  let component: ReportNewsSummaryComponent;
  let fixture: ComponentFixture<ReportNewsSummaryComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ReportNewsSummaryComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportNewsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
