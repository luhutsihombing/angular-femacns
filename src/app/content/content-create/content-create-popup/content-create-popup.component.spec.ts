import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCreatePopupComponent } from './content-create-popup.component';

describe('ContentCreatePopupComponent', () => {
  let component: ContentCreatePopupComponent;
  let fixture: ComponentFixture<ContentCreatePopupComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentCreatePopupComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentCreatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
