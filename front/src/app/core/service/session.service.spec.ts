import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { skip, take } from 'rxjs';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose login state changes', () => {
    const values: boolean[] = [];

    service
      .$isLogged()
      .pipe(skip(1), take(2))
      .subscribe((value) => values.push(value));

    service.logIn({ token: 't', type: 'Bearer', username: 'u', firstName: 'f', lastName: 'l', admin: false, id: 1 });
    service.logOut();

    expect(values).toEqual([true, false]);
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });
});
