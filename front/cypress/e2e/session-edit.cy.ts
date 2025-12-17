/// <reference types="cypress" />

describe('Session edit', () => {
  it('should edit a session', () => {
    let session: any = {
      id: 123,
      name: 'Session 123',
      description: 'Old desc',
      date: '2025-01-01T00:00:00.000Z',
      teacher_id: 1,
      users: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    };

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
      body: [session],
    }).as('sessions');

    cy.intercept('GET', '**/api/teacher', {
      body: [{ id: 1, firstName: 'Jane', lastName: 'Doe', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    }).as('teachers');

    cy.intercept('GET', '**/api/session/123', (req: any) => req.reply(session)).as('sessionDetail');

    cy.intercept('GET', '**/api/teacher/1', {
      body: { id: 1, firstName: 'Jane', lastName: 'Doe', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' },
    }).as('teacherDetail');

    cy.intercept('PUT', '**/api/session/123', (req: any) => {
      session = { ...session, ...req.body, updatedAt: '2025-01-03T00:00:00.000Z' };
      req.reply({ statusCode: 200, body: session });
    }).as('updateSession');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('sessions-edit-123').click();
    cy.wait('@sessionDetail');
    cy.wait('@teachers');
    cy.url().should('include', '/sessions/update/123');

    cy.getByCy('session-description').clear().type('New desc');
    cy.getByCy('session-save').click();

    cy.wait('@updateSession');
    cy.wait('@sessions');
    cy.url().should('include', '/sessions');

    cy.getByCy('sessions-detail-123').click();
    cy.wait('@sessionDetail');
    cy.wait('@teacherDetail');

    cy.getByCy('session-description').should('contain', 'New desc');
  });

  it('should disable Save button when required fields are missing', () => {
    const session = {
      id: 123,
      name: 'Session 123',
      description: 'Old desc',
      date: '2025-01-01T00:00:00.000Z',
      teacher_id: 1,
      users: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    };

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

    cy.intercept('GET', '**/api/session*', { body: [session] }).as('sessions');
    cy.intercept('GET', '**/api/teacher', {
      body: [{ id: 1, firstName: 'Jane', lastName: 'Doe', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    }).as('teachers');
    cy.intercept('GET', '**/api/session/123', { body: session }).as('sessionDetail');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('sessions-edit-123').click();
    cy.wait('@sessionDetail');
    cy.wait('@teachers');

    cy.getByCy('session-save').should('not.be.disabled');
    cy.getByCy('session-name').clear();
    cy.getByCy('session-save').should('be.disabled');
  });
});

