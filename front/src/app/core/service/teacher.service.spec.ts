import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { Teacher } from '../models/teacher.interface';
import { TeacherService } from './teacher.service';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call all()', () => {
    const teachers: Teacher[] = [{ id: 1, firstName: 'A', lastName: 'B', createdAt: new Date(), updatedAt: new Date() }];

    service.all().subscribe((value) => expect(value).toEqual(teachers));

    const req = httpMock.expectOne('api/teacher');
    expect(req.request.method).toBe('GET');
    req.flush(teachers);
  });

  it('should call detail()', () => {
    const teacher: Teacher = { id: 1, firstName: 'A', lastName: 'B', createdAt: new Date(), updatedAt: new Date() };

    service.detail('1').subscribe((value) => expect(value).toEqual(teacher));

    const req = httpMock.expectOne('api/teacher/1');
    expect(req.request.method).toBe('GET');
    req.flush(teacher);
  });
});
