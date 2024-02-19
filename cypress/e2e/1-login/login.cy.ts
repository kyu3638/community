describe('template spec', () => {
  it('visit', () => {
    cy.visit('/login');
    cy.get('[data-cy=idInput]').as('idInput');
    cy.get('[data-cy=passwordInput]').as('passwordInput');

    cy.get('@idInput').type('tmdrbwjs@naver.com');
    cy.get('@passwordInput').type('asdfasdf!@');

    cy.get('@idInput').invoke('val').should('eq', 'tmdrbwjs@naver.com');
    cy.get('@passwordInput').invoke('val').should('eq', 'asdfasdf!@');

    cy.get('[data-cy=loginButton]').as('loginButton');
    cy.get('[data-cy=loginButton]').click();

    cy.url().should('include', 'http://localhost:5173/');
  });
});
 