/// <reference types="cypress" />

describe('Session delete', () => {
  it('should delete a session', () => {
    let sessions: any[] = [
      {
        id: 123,
        name: 'To delete',
        description: 'Desc',
        date: '2025-01-01T00:00:00.000Z',
        teacher_id: 1,
        users: [],
      },
      {
        id: 456,
        name: 'Other',
        description: 'Desc',
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

    cy.intercept('GET', '**/api/session/123', {
      body: {
        id: 123,
        name: 'To delete',
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

    cy.intercept('DELETE', '**/api/session/123', (req: any) => {
      sessions = sessions.filter((s) => s.id !== 123);
      req.reply({ statusCode: 200, body: {} });
    }).as('deleteSession');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('sessions-detail-123').click();
    cy.wait('@sessionDetail');
    cy.wait('@teacherDetail');

    cy.getByCy('session-delete').click();

    cy.wait('@deleteSession');
    cy.wait('@sessions');

    cy.url().should('include', '/sessions');
    cy.getByCy('sessions-list').should('not.contain', 'To delete');
  });
});

