import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThinkwareViewComponent } from './thinkware-view.component';

describe('ThinkwareViewComponent', () => {
  let component: ThinkwareViewComponent;
  let fixture: ComponentFixture<ThinkwareViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ThinkwareViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ThinkwareViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
