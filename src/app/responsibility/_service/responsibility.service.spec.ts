import { TestBed, inject } from '@angular/core/testing';

import { ResponsibilityService } from './responsibility.service';

describe('ResponsibilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResponsibilityService]
    });
  });

  it(
    'should be created',
    inject([ResponsibilityService], (service: ResponsibilityService) => {
      expect(service).toBeTruthy();
    })
  );
});
