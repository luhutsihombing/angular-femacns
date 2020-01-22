import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingAreaCreateComponent } from './mapping-area-create.component';

describe('MappingAreaCreateComponent', () => {
  let component: MappingAreaCreateComponent;
  let fixture: ComponentFixture<MappingAreaCreateComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MappingAreaCreateComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingAreaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
