import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingAreaViewComponent } from './mapping-area-view.component';

describe('counterpartSearchComponent', () => {
  let component: MappingAreaViewComponent;
  let fixture: ComponentFixture<MappingAreaViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MappingAreaViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingAreaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
