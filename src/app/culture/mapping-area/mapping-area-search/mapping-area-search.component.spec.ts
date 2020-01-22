import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingAreaSearchComponent } from './mapping-area-search.component';

describe('counterpartSearchComponent', () => {
  let component: MappingAreaSearchComponent;
  let fixture: ComponentFixture<MappingAreaSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MappingAreaSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingAreaSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
