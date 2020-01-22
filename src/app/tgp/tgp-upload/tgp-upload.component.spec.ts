import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TgpUploadComponent } from './tgp-upload.component';

describe('TgpUploadComponent', () => {
  let component: TgpUploadComponent;
  let fixture: ComponentFixture<TgpUploadComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [TgpUploadComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TgpUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
