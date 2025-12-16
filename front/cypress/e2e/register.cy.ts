describe('Register', () => {
  it('Register should be successful', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 200,
      body: {},
    }).as('register');

    cy.visit('/register');

    cy.getByCy('register-firstName').type('John');
    cy.getByCy('register-lastName').type('Doe');
    cy.getByCy('register-email').type('john.doe@example.com');
    cy.getByCy('register-password').type('test!1234');
    cy.getByCy('register-submit').click();

    cy.wait('@register')
      .its('request.body')
      .should('deep.include', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'test!1234',
      });

    cy.url().should('include', '/login');
  });

  it('Register should be disabled when fields are empty', () => {
    cy.visit('/register');

    cy.getByCy('register-submit').should('be.disabled');
    cy.getByCy('register-firstName').type('John');
    cy.getByCy('register-submit').should('be.disabled');
    cy.getByCy('register-lastName').type('Doe');
    cy.getByCy('register-submit').should('be.disabled');
    cy.getByCy('register-email').type('john.doe@example.com');
    cy.getByCy('register-submit').should('be.disabled');
    cy.getByCy('register-password').type('test!1234');
    cy.getByCy('register-submit').should('not.be.disabled');
  });
});

