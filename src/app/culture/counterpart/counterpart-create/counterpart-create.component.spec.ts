import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterpartCreateComponent } from './counterpart-create.component';

describe('CounterpartCreateComponent', () => {
  let component: CounterpartCreateComponent;
  let fixture: ComponentFixture<CounterpartCreateComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [CounterpartCreateComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterpartCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
