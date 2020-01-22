import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterpartSearchComponent } from './counterpart-search.component';

describe('counterpartSearchComponent', () => {
  let component: CounterpartSearchComponent;
  let fixture: ComponentFixture<CounterpartSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [CounterpartSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterpartSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
