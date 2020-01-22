import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportNewsDetailComponent } from './report-news-detail.component';

describe('ReportNewsDetailComponent', () => {
  let component: ReportNewsDetailComponent;
  let fixture: ComponentFixture<ReportNewsDetailComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ReportNewsDetailComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportNewsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
