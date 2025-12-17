/// <reference types="cypress" />

describe('Session create', () => {
  it('should create a new session', () => {
    let sessions: any[] = [
      {
        id: 1,
        name: 'Existing session',
        description: 'Existing desc',
        date: '2025-01-01T00:00:00.000Z',
        teacher_id: 1,
        users: [],
      },
    ];

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

    cy.intercept('GET', '**/api/session*', (req: any) => req.reply(sessions)).as('sessions');

    cy.intercept('GET', '**/api/teacher', {
      body: [{ id: 1, firstName: 'Jane', lastName: 'Doe', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    }).as('teachers');

    cy.intercept('POST', '**/api/session', (req: any) => {
      expect(req.body).to.deep.include({
        name: 'New session',
        date: '2025-02-02',
        teacher_id: 1,
        description: 'New desc',
      });

      const created = {
        id: 999,
        ...req.body,
        users: [],
      };
      sessions = [...sessions, created];
      req.reply({ statusCode: 200, body: created });
    }).as('createSession');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('sessions-create').click();
    cy.wait('@teachers');
    cy.url().should('include', '/sessions/create');

    cy.getByCy('session-name').type('New session');
    cy.getByCy('session-date').type('2025-02-02');
    cy.getByCy('session-teacher').click();
    cy.contains('mat-option', 'Jane Doe').click();
    cy.getByCy('session-description').type('New desc');

    cy.getByCy('session-save').click();

    cy.wait('@createSession');
    cy.wait('@sessions');

    cy.url().should('include', '/sessions');
    cy.getByCy('sessions-list').should('contain', 'New session');
  });

  it('should disable Save button when required fields are missing', () => {
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

    cy.intercept('GET', '**/api/session*', { body: [] }).as('sessions');
    cy.intercept('GET', '**/api/teacher', {
      body: [{ id: 1, firstName: 'Jane', lastName: 'Doe', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' }],
    }).as('teachers');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('sessions-create').click();
    cy.wait('@teachers');

    cy.getByCy('session-save').should('be.disabled');

    cy.getByCy('session-name').type('New session');
    cy.getByCy('session-save').should('be.disabled');

    cy.getByCy('session-date').type('2025-02-02');
    cy.getByCy('session-save').should('be.disabled');

    cy.getByCy('session-teacher').click();
    cy.contains('mat-option', 'Jane Doe').click();
    cy.getByCy('session-save').should('be.disabled');

    cy.getByCy('session-description').type('New desc');
    cy.getByCy('session-save').should('not.be.disabled');
  });
});

