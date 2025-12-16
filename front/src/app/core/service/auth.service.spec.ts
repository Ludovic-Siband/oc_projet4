import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { LoginRequest } from '../models/loginRequest.interface';
import { RegisterRequest } from '../models/registerRequest.interface';
import { SessionInformation } from '../models/sessionInformation.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should register', () => {
    const request: RegisterRequest = {
      email: 'a@b.c',
      firstName: 'A',
      lastName: 'B',
      password: 'pwd',
    };

    service.register(request).subscribe((value) => expect(value).toBeUndefined());

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(null);
  });

  it('should login', () => {
    const request: LoginRequest = { email: 'a@b.c', password: 'pwd' };
    const response: SessionInformation = {
      token: 't',
      type: 'Bearer',
      id: 1,
      username: 'u',
      firstName: 'A',
      lastName: 'B',
      admin: false,
    };

    service.login(request).subscribe((value) => expect(value).toEqual(response));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response);
  });
});

