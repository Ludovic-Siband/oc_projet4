/// <reference types="cypress" />

describe('Account', () => {
  it('should display user information', () => {
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

    cy.intercept('GET', '**/api/user/1', {
      body: {
        id: 1,
        email: 'yoga@studio.com',
        firstName: 'First',
        lastName: 'Last',
        admin: true,
        password: 'secret',
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-02T00:00:00.000Z',
      },
    }).as('me');

    cy.visit('/login');
    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.getByCy('nav-account').click();
    cy.wait('@me');

    cy.url().should('include', '/me');
    cy.getByCy('account-name').should('contain', 'First');
    cy.getByCy('account-email').should('contain', 'yoga@studio.com');
    cy.getByCy('account-role').should('contain', 'admin');
  });
});

