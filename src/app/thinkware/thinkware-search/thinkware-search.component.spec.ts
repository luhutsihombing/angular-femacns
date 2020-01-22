import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThinkwareSearchComponent } from './thinkware-search.component';

describe('ThinkwareSearchComponent', () => {
  let component: ThinkwareSearchComponent;
  let fixture: ComponentFixture<ThinkwareSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ThinkwareSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ThinkwareSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
