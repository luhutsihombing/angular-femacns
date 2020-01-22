import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewBannerComponent } from './content-view-banner.component';

describe('ContentViewBannerComponent', () => {
  let component: ContentViewBannerComponent;
  let fixture: ComponentFixture<ContentViewBannerComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentViewBannerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
