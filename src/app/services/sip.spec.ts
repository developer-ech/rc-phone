import { TestBed } from '@angular/core/testing';

import { Sip } from './sip';

describe('Sip', () => {
  let service: Sip;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sip);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
