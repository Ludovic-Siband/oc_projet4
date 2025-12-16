import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { throwError } from 'rxjs';

import { AuthService } from 'src/app/core/service/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  const authServiceMock = {
    register: jest.fn(),
  };

  beforeEach(async () => {
    authServiceMock.register.mockReset();

    await TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,  
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        RegisterComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set onError when register fails', () => {
    authServiceMock.register.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server error' }))
    );

    component.form.setValue({
      email: 'a@b.c',
      firstName: 'A',
      lastName: 'B',
      password: 'pwd',
    });
    component.submit();

    expect(component.onError).toBe(true);
  });
});
