import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingAreaEditComponent } from './mapping-area-edit.component';

describe('counterpartSearchComponent', () => {
  let component: MappingAreaEditComponent;
  let fixture: ComponentFixture<MappingAreaEditComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MappingAreaEditComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingAreaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
