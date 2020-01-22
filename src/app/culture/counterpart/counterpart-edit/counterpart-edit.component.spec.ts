import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterpartEditComponent } from './counterpart-edit.component';

describe('counterpartSearchComponent', () => {
  let component: CounterpartEditComponent;
  let fixture: ComponentFixture<CounterpartEditComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [CounterpartEditComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterpartEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
