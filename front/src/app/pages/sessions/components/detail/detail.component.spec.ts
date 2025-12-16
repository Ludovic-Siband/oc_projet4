import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionService } from '../../../../core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';

import { DetailComponent } from './detail.component';


describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let router: Router;

  const session: Session = {
    id: 10,
    name: 'S1',
    description: 'D',
    date: new Date('2024-01-01'),
    teacher_id: 1,
    users: [1],
  };

  const teacher: Teacher = {
    id: 1,
    firstName: 'A',
    lastName: 'B',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sessionServiceMock = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  };

  const sessionApiServiceMock = {
    detail: jest.fn(),
    delete: jest.fn(),
    participate: jest.fn(),
    unParticipate: jest.fn(),
  };

  const teacherServiceMock = {
    detail: jest.fn(),
  };

  const matSnackBarMock = {
    open: jest.fn(),
  };

  beforeEach(async () => {
    sessionApiServiceMock.detail.mockReset();
    sessionApiServiceMock.delete.mockReset();
    sessionApiServiceMock.participate.mockReset();
    sessionApiServiceMock.unParticipate.mockReset();
    teacherServiceMock.detail.mockReset();
    matSnackBarMock.open.mockReset();

    sessionApiServiceMock.detail.mockReturnValue(of(session));
    sessionApiServiceMock.delete.mockReturnValue(of(void 0));
    sessionApiServiceMock.participate.mockReturnValue(of(void 0));
    sessionApiServiceMock.unParticipate.mockReturnValue(of(void 0));
    teacherServiceMock.detail.mockReturnValue(of(teacher));

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        DetailComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '10' }) } } },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
      ],
    });
    TestBed.overrideComponent(DetailComponent, {
      set: { providers: [{ provide: MatSnackBar, useValue: matSnackBarMock }] },
    });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch session and teacher on init', () => {
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('10');
    expect(teacherServiceMock.detail).toHaveBeenCalledWith('1');
    expect(component.session?.id).toBe(10);
    expect(component.teacher?.id).toBe(1);
    expect(component.isParticipate).toBe(true);
    expect(component.isAdmin).toBe(true);
  });

  it('should go back', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

    component.back();

    expect(backSpy).toHaveBeenCalled();
  });

  it('should participate then refresh', () => {
    expect(sessionApiServiceMock.detail).toHaveBeenCalledTimes(1);

    component.participate();

    expect(sessionApiServiceMock.participate).toHaveBeenCalledWith('10', '1');
    expect(sessionApiServiceMock.detail).toHaveBeenCalledTimes(2);
  });
});
