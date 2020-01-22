import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupCreateComponent } from './lookup-create.component';

describe('LookupCreateComponent', () => {
  let component: LookupCreateComponent;
  let fixture: ComponentFixture<LookupCreateComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [LookupCreateComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
