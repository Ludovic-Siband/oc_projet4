/// <reference types="cypress" />

describe('Session detail', () => {
  it('should display session details and delete button for admin', () => {
    cy.intercept('POST', '**/api/auth/login', {
      body: {
        token: 't',
        type: 'Bearer',
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true,
      },
    }).as('login');

    cy.intercept('GET', '**/api/session*', {
      body: [
        {
          id: 123,
          name: 'Session 123',
          description: 'Desc',
          date: '2025-01-01T00:00:00.000Z',
          teacher_id: 1,
          users: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
        },
      ],
    }).as('sessions');

    cy.intercept('GET', '**/api/session/123', {
      body: {
        id: 123,
        name: 'Session 123',
        description: 'Desc',
        date: '2025-01-01T00:00:00.000Z',
        teacher_id: 1,
        users: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    }).as('sessionDetail');

    cy.intercept('GET', '**/api/teacher/1', {
      body: { id: 1, firstName: 'Jane', lastName: 'Doe', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' },
    }).as('teacherDetail');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('sessions-detail-123').click();

    cy.wait('@sessionDetail');
    cy.wait('@teacherDetail');

    cy.url().should('include', '/sessions/detail/123');
    cy.getByCy('session-title').should('contain', 'Session 123');
    cy.getByCy('session-date').should('contain', '2025');
    cy.getByCy('session-description').should('contain', 'Desc');
    cy.getByCy('session-delete').should('be.visible');
  });

  it('should not display delete button for non-admin', () => {
    cy.intercept('POST', '**/api/auth/login', {
      body: {
        token: 't',
        type: 'Bearer',
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: false,
      },
    }).as('login');

    cy.intercept('GET', '**/api/session*', {
      body: [
        {
          id: 123,
          name: 'Session 123',
          description: 'Desc',
          date: '2025-01-01T00:00:00.000Z',
          teacher_id: 1,
          users: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
        },
      ],
    }).as('sessions');

    cy.intercept('GET', '**/api/session/123', {
      body: {
        id: 123,
        name: 'Session 123',
        description: 'Desc',
        date: '2025-01-01T00:00:00.000Z',
        teacher_id: 1,
        users: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    }).as('sessionDetail');

    cy.intercept('GET', '**/api/teacher/1', {
      body: { id: 1, firstName: 'Jane', lastName: 'Doe', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' },
    }).as('teacherDetail');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('sessions-detail-123').click();

    cy.wait('@sessionDetail');
    cy.wait('@teacherDetail');

    cy.url().should('include', '/sessions/detail/123');
    cy.getByCy('session-delete').should('not.exist');
  });
});

