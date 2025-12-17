/// <reference types="cypress" />

describe('Logout', () => {
  it('should logout and redirect to login page', () => {
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

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');
    cy.url().should('include', '/sessions');

    cy.getByCy('nav-logout').click();
    cy.url().should('include', '/login');
    cy.getByCy('nav-login').should('be.visible');
    cy.getByCy('nav-sessions').should('not.exist');

    cy.intercept('GET', '**/api/session*').as('sessionsAfterLogout');
    cy.visit('/sessions');
    cy.url().should('include', '/login');
    cy.get('@sessionsAfterLogout.all').should('have.length', 0);
  });
});

