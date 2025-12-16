import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { SessionService } from 'src/app/core/service/session.service';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { Session } from '../../../../core/models/session.interface';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  const sessionApiServiceMock = {
    detail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const teacherServiceMock = {
    all: jest.fn(),
  };

  const matSnackBarMock = {
    open: jest.fn(),
  };

  const baseSession: Session = {
    id: 10,
    name: 'Old',
    description: 'Old desc',
    date: new Date('2024-01-02'),
    teacher_id: 1,
    users: [],
  };

  async function setup(options: { admin: boolean; url: string }): Promise<{
    fixture: ComponentFixture<FormComponent>;
    component: FormComponent;
    routerMock: { url: string; navigate: jest.Mock };
  }> {
    sessionApiServiceMock.detail.mockClear();
    sessionApiServiceMock.create.mockClear();
    sessionApiServiceMock.update.mockClear();
    teacherServiceMock.all.mockReset();
    matSnackBarMock.open.mockReset();

    teacherServiceMock.all.mockReturnValue(of([]));

    const routerMock = {
      url: options.url,
      navigate: jest.fn().mockResolvedValue(true),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, BrowserAnimationsModule, FormComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '10' }) } } },
        { provide: SessionService, useValue: { sessionInformation: { admin: options.admin, id: 1 } } },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
      ],
    });

    TestBed.overrideComponent(FormComponent, {
      set: { providers: [{ provide: MatSnackBar, useValue: matSnackBarMock }] },
    });

    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(FormComponent);
    fixture.detectChanges();

    return { fixture, component: fixture.componentInstance, routerMock };
  }

  it('should create', async () => {
    const { component } = await setup({ admin: true, url: '/sessions/create' });
    expect(component).toBeTruthy();
  });

  it('should redirect non-admin users', async () => {
    const { routerMock } = await setup({ admin: false, url: '/sessions/create' });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should create a session when not updating', async () => {
    const { component, routerMock } = await setup({ admin: true, url: '/sessions/create' });
    sessionApiServiceMock.create.mockReturnValue(of({ id: 1 } as Session));

    component.sessionForm?.setValue({
      name: 'S1',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'D',
    });

    component.submit();

    expect(sessionApiServiceMock.create).toHaveBeenCalled();
    expect(matSnackBarMock.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should load session and update it when updating', async () => {
    sessionApiServiceMock.detail.mockReturnValue(of(baseSession));
    sessionApiServiceMock.update.mockReturnValue(of({ ...baseSession, name: 'New' }));

    const { component, routerMock } = await setup({ admin: true, url: '/sessions/update/10' });

    expect(component.onUpdate).toBe(true);
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('10');

    component.sessionForm?.setValue({
      name: 'New',
      date: new Date(baseSession.date).toISOString().split('T')[0],
      teacher_id: 1,
      description: 'New desc',
    });

    component.submit();

    expect(sessionApiServiceMock.update).toHaveBeenCalledWith('10', expect.any(Object));
    expect(matSnackBarMock.open).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });
});
