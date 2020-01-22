import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingCellHoViewComponent } from './mapping-cell-ho-view.component';

describe('ResponsibilityViewComponent', () => {
  let component: MappingCellHoViewComponent;
  let fixture: ComponentFixture<MappingCellHoViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MappingCellHoViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingCellHoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
