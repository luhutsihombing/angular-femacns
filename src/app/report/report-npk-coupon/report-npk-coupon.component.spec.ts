import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportNpkCouponComponent } from './report-npk-coupon.component';

describe('ReportNpkCouponComponent', () => {
  let component: ReportNpkCouponComponent;
  let fixture: ComponentFixture<ReportNpkCouponComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ReportNpkCouponComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportNpkCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
