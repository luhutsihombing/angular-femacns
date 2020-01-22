import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCreateBannerComponent } from './content-create-banner.component';

describe('ContentCreateBannerComponent', () => {
  let component: ContentCreateBannerComponent;
  let fixture: ComponentFixture<ContentCreateBannerComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentCreateBannerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentCreateBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
