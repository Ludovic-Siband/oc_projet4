declare global {
  namespace Cypress {
    interface Chainable {
      getByCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('getByCy', (value: string) => cy.get(`[data-cy="${value}"]`));

export {};
