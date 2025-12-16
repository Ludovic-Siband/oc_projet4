import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { EMPTY, of } from 'rxjs';
import { SessionService } from 'src/app/core/service/session.service';
import { User } from 'src/app/core/models/user.interface';
import { UserService } from 'src/app/core/service/user.service';

import { MeComponent } from './me.component';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let router: Router;

  const sessionServiceMock = {
    sessionInformation: {
      admin: true,
      id: 1
    },
    logOut: jest.fn(),
  };

  const userServiceMock = {
    getById: jest.fn(),
    delete: jest.fn(),
  };

  const matSnackBarMock = {
    open: jest.fn(),
  };

  beforeEach(async () => {
    sessionServiceMock.logOut.mockReset();
    userServiceMock.getById.mockReset();
    userServiceMock.delete.mockReset();
    matSnackBarMock.open.mockReset();

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
    userServiceMock.getById.mockReturnValue(of(user));
    userServiceMock.delete.mockReturnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MeComponent
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    });
    TestBed.overrideComponent(MeComponent, {
      set: { providers: [{ provide: MatSnackBar, useValue: matSnackBarMock }] },
    });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on init', () => {
    expect(userServiceMock.getById).toHaveBeenCalledWith('1');
    expect(component.user?.id).toBe(1);
  });

  it('should go back', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

    component.back();

    expect(backSpy).toHaveBeenCalled();
  });

  it('should call user deletion', () => {
    userServiceMock.delete.mockReturnValue(EMPTY);

    component.delete();

    expect(userServiceMock.delete).toHaveBeenCalledWith('1');
  });
});
