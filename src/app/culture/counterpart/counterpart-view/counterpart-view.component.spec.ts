import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterpartViewComponent } from './counterpart-view.component';

describe('counterpartSearchComponent', () => {
  let component: CounterpartViewComponent;
  let fixture: ComponentFixture<CounterpartViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [CounterpartViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterpartViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
