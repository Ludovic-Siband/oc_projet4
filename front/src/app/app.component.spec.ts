import { TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { take } from 'rxjs';

import { AuthService } from './core/service/auth.service';
import { SessionService } from './core/service/session.service';
import { AppComponent } from './app.component';


describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatToolbarModule,
        AppComponent
      ],
      providers: [{ provide: AuthService, useValue: {} }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should expose $isLogged from SessionService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const sessionService = TestBed.inject(SessionService);

    sessionService.logIn({ token: 't', type: 'Bearer', id: 1, username: 'u', firstName: 'f', lastName: 'l', admin: false });

    app.$isLogged().pipe(take(1)).subscribe((value) => expect(value).toBe(true));
  });

  it('should logout and navigate home', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const sessionService = TestBed.inject(SessionService);
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const logoutSpy = jest.spyOn(sessionService, 'logOut');

    app.logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['']);
  });
});
