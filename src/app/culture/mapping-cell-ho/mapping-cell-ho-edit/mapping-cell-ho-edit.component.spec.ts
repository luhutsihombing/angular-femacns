import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupEditComponent } from './lookup-edit.component';

describe('LookupEditComponent', () => {
  let component: LookupEditComponent;
  let fixture: ComponentFixture<LookupEditComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [LookupEditComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
