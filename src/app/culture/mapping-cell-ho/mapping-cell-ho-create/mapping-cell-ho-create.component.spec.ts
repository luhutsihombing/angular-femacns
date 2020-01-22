import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingCellHoCreateComponent } from './mapping-cell-ho-create.component';

describe('LookupCreateComponent', () => {
  let component: MappingCellHoCreateComponent;
  let fixture: ComponentFixture<MappingCellHoCreateComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MappingCellHoCreateComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingCellHoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
