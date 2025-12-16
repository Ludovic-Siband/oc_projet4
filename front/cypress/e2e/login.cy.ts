describe('Login', () => {
  it('Login should be successful', () => {
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

    cy.intercept('GET', '**/api/session*', (req) => {
      expect(req.headers).to.have.property('authorization', 'Bearer t');
      req.reply([
        {
          id: 123,
          name: 'Session 123',
          description: 'Desc',
          date: '2025-01-01T00:00:00.000Z',
          teacher_id: 1,
          users: [],
        },
      ]);
    }).as('sessions');

    cy.visit('/login');

    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.wait('@sessions');
    cy.url().should('include', '/sessions');
    cy.getByCy('sessions-list').find('[data-cy="sessions-item"]').should('have.length.at.least', 1);
  });

  it('Login should fail with wrong credentials', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {},
    }).as('login');

    cy.visit('/login');

    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-password').type('wrong');
    cy.getByCy('login-submit').click();

    cy.wait('@login');
    cy.getByCy('login-error').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('Login should be disabled when fields are empty', () => {
    cy.visit('/login');

    cy.getByCy('login-submit').should('be.disabled');

    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-submit').should('be.disabled');

    cy.getByCy('login-email').clear();
    cy.getByCy('login-password').type('test!1234');
    cy.getByCy('login-submit').should('be.disabled');

    cy.getByCy('login-email').type('yoga@studio.com');
    cy.getByCy('login-submit').should('not.be.disabled');
  });
});
