import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { User } from '../models/user.interface';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getById()', () => {
    const user: User = {
      id: 1,
      email: 'a@b.c',
      lastName: 'B',
      firstName: 'A',
      admin: false,
      password: 'pwd',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    service.getById('1').subscribe((value) => expect(value).toEqual(user));

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('GET');
    req.flush(user);
  });

  it('should call delete()', () => {
    service.delete('1').subscribe((value) => expect(value).toBeUndefined());

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
