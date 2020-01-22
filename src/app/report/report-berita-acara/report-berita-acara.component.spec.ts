import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBeritaAcaraSearchComponent } from './report-berita-acara-search.component';

describe('ReportBeritaAcaraSearchComponent', () => {
  let component: ReportBeritaAcaraSearchComponent;
  let fixture: ComponentFixture<ReportBeritaAcaraSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ReportBeritaAcaraSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBeritaAcaraSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
