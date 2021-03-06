import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelViewComponent } from './channel-view.component';

describe('ChannelViewComponent', () => {
  let component: ChannelViewComponent;
  let fixture: ComponentFixture<ChannelViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ChannelViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
