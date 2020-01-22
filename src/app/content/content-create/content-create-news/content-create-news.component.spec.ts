import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentCreateNewsComponent } from './content-create-news.component';

describe('ContentCreateNewsComponent', () => {
  let component: ContentCreateNewsComponent;
  let fixture: ComponentFixture<ContentCreateNewsComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentCreateNewsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentCreateNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
