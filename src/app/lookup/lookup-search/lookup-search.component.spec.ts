import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupSearchComponent } from './lookup-search.component';

describe('LookupSearchComponent', () => {
  let component: LookupSearchComponent;
  let fixture: ComponentFixture<LookupSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [LookupSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
