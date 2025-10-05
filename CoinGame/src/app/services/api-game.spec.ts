import { TestBed } from '@angular/core/testing';

import { ApiGame } from './api-game';

describe('ApiGame', () => {
  let service: ApiGame;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiGame);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
