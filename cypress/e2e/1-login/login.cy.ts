describe('로그인 화면', () => {
  it('사용자는 아이디와 비밀번호를 사용해서 로그인한다.', () => {
    // given - 로그인 화면에 접근한다.
    cy.visit('/login');

    cy.get('[data-cy=idInput]').as('idInput');
    cy.get('[data-cy=passwordInput]').as('passwordInput');

    // when - 아이디와 비밀번호를 입력하고 로그인 버튼을 클릭한다.
    cy.get('@idInput').type('tmdrbwjs@naver.com');
    cy.get('@passwordInput').type('asdfasdf!@');

    cy.get('@idInput').invoke('val').should('eq', 'tmdrbwjs@naver.com');
    cy.get('@passwordInput').invoke('val').should('eq', 'asdfasdf!@');

    cy.get('[data-cy=loginButton]').as('loginButton');
    cy.get('[data-cy=loginButton]').click();

    // then - 로그인에 성공하고 메인화면으로 이동한다.
    cy.url().should('include', 'http://localhost:5173/');
  });
});
