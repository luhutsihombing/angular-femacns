import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewPopupComponent } from './content-view-popup.component';

describe('ContentViewPopupComponent', () => {
  let component: ContentViewPopupComponent;
  let fixture: ComponentFixture<ContentViewPopupComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentViewPopupComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
