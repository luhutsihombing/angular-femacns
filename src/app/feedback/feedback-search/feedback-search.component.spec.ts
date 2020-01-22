import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackSearchComponent } from './feedback-search.component';

describe('feedbackSearchComponent', () => {
  let component: FeedbackSearchComponent;
  let fixture: ComponentFixture<FeedbackSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [FeedbackSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
