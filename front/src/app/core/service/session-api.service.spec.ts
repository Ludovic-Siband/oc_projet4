import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { provideHttpClient } from '@angular/common/http';
import { Session } from '../models/session.interface';

import { SessionApiService } from './session-api.service';

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call all()', () => {
    const mockSessions: Session[] = [
      { id: 1, name: 'S1', description: 'D', date: new Date('2024-01-01'), teacher_id: 1, users: [] },
    ];

    service.all().subscribe((sessions) => expect(sessions).toEqual(mockSessions));

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  it('should call detail()', () => {
    const mockSession: Session = { id: 1, name: 'S1', description: 'D', date: new Date('2024-01-01'), teacher_id: 1, users: [1] };

    service.detail('1').subscribe((session) => expect(session).toEqual(mockSession));

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSession);
  });
});
