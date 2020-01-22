import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThinkwareCreateComponent } from './thinkware-create.component';

describe('ResponsibilityCreateComponent', () => {
  let component: ThinkwareCreateComponent;
  let fixture: ComponentFixture<ThinkwareCreateComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ThinkwareCreateComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ThinkwareCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
