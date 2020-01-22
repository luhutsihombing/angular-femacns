import { TestBed, inject } from '@angular/core/testing';

import { ThinkwareService } from './thinkware.service';

describe('ThinkwareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThinkwareService]
    });
  });

  it(
    'should be created',
    inject([ThinkwareService], (service: ThinkwareService) => {
      expect(service).toBeTruthy();
    })
  );
});
