import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingCellHoSearchComponent } from './mapping-cell-ho-search.component';

describe('LookupSearchComponent', () => {
  let component: MappingCellHoSearchComponent;
  let fixture: ComponentFixture<MappingCellHoSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MappingCellHoSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingCellHoSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
