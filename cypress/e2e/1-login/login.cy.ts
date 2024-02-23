describe('로그인 화면', () => {
  it('로그인 버튼은 이메일과 비밀번호가 입력되었을 때만 활성화한다.', () => {
    // 로그인 화면에 접근
    cy.visit('/login');

    // 로그인 버튼은 비활성화로 초기화 되어 있어야 한다.
    cy.get('[data-cy=loginButton]').as('loginButton');
    cy.get('@loginButton').should('be.disabled');

    // idInput과 passwordInput을 확인하고 값을 입력한다.
    cy.get('[data-cy=idInput]').as('idInput');
    cy.get('[data-cy=passwordInput]').as('passwordInput');

    cy.get('@idInput').type('tmdrbwjs@naver.com');
    cy.get('@passwordInput').type('asdfasdf!@');

    // 로그인 버튼이 활성화 되어 있어야 한다.
    cy.get('@loginButton').should('not.be.disabled');
  });

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
    cy.get('@loginButton').click();

    // then - 로그인에 성공하고 메인화면으로 이동한다.
    cy.url().should('include', 'http://localhost:5173/');
  });
});
