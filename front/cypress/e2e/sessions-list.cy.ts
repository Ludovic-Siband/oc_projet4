/// <reference types="cypress" />

function loginAndLandOnSessions(options: { admin: boolean; sessions: any[] }) {
  cy.intercept('POST', '**/api/auth/login', {
    body: {
      token: 't',
      type: 'Bearer',
      id: 1,
      username: 'userName',
      firstName: 'firstName',
      lastName: 'lastName',
      admin: options.admin,
    },
  }).as('login');

  cy.intercept('GET', '**/api/session*', {
    body: options.sessions,
  }).as('sessions');

  cy.visit('/login');
  cy.getByCy('login-email').type('yoga@studio.com');
  cy.getByCy('login-password').type('test!1234');
  cy.getByCy('login-submit').click();

  cy.wait('@login');
  cy.wait('@sessions');
  cy.url().should('include', '/sessions');
}

describe('Sessions (liste)', () => {
  it('should display a list of sessions', () => {
    loginAndLandOnSessions({
      admin: false,
      sessions: [
        {
          id: 123,
          name: 'Session 123',
          description: 'Desc',
          date: '2025-01-01T00:00:00.000Z',
          teacher_id: 1,
          users: [],
        },
      ],
    });

    cy.getByCy('sessions-list').find('[data-cy="sessions-item"]').should('have.length.at.least', 1);
  });

  it('should display Create and Edit buttons only for admin', () => {
    loginAndLandOnSessions({
      admin: true,
      sessions: [
        {
          id: 123,
          name: 'Session 123',
          description: 'Desc',
          date: '2025-01-01T00:00:00.000Z',
          teacher_id: 1,
          users: [],
        },
      ],
    });

    cy.getByCy('sessions-create').should('be.visible');
    cy.getByCy('sessions-detail-123').should('be.visible');
    cy.getByCy('sessions-edit-123').should('be.visible');
  });

  it('should not display Create and Edit buttons for non-admin', () => {
    loginAndLandOnSessions({
      admin: false,
      sessions: [
        {
          id: 123,
          name: 'Session 123',
          description: 'Desc',
          date: '2025-01-01T00:00:00.000Z',
          teacher_id: 1,
          users: [],
        },
      ],
    });

    cy.getByCy('sessions-create').should('not.exist');
    cy.getByCy('sessions-detail-123').should('be.visible');
    cy.getByCy('sessions-edit-123').should('not.exist');
  });
});

