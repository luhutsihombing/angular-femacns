import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TgpSearchComponent } from './tgp-search.component';

describe('TgpSearchComponent', () => {
  let component: TgpSearchComponent;
  let fixture: ComponentFixture<TgpSearchComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [TgpSearchComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TgpSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
