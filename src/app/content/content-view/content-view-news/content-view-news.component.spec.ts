import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewNewsComponent } from './content-view-news.component';

describe('ContentViewNewsComponent', () => {
  let component: ContentViewNewsComponent;
  let fixture: ComponentFixture<ContentViewNewsComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentViewNewsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
