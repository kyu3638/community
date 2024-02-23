describe('회원가입 1단계', () => {
  beforeEach(() => {
    // 회원가입 1단계 페이지에 접근
    cy.visit('/sign-up-step-one');

    cy.get('[data-cy=emailInput]').as('emailInput');
    cy.get('[data-cy=isEmailValidMessage]').as('isEmailValidMessage');

    cy.get('[data-cy=passwordInput]').as('passwordInput');
    cy.get('[data-cy=checkPasswordInput]').as('checkPasswordInput');
  });

  it('이메일이 유효하지 않을 경우 알림 메세지가 나온다', () => {
    cy.get('@emailInput').type('test@test');
    cy.get('@isEmailValidMessage').should('have.text', '이메일 형식이 올바르지 않습니다.');
  });

  it('이메일이 유효할 경우 메세지가 나오지 않는다', () => {
    cy.get('@emailInput').type('test@test');
    cy.get('@isEmailValidMessage').should('not.have.text');
  });

  it('비밀번호가 일치하지 않는 경우 메세지가 나온다.', () => {
    cy.get('@passwordInput').type('asdfasdf!@');
    cy.get('@checkPasswordInput').type('asdfasdf!#');

    cy.get('[data-cy=PasswordSameMessage]').as('PasswordSameMessage');

    cy.get('@PasswordSameMessage').should('have.text', '비밀번호가 일치하지 않습니다.');
  });

  it('비밀번호가 10자리 이내인 경우 경우 메세지가 나온다.', () => {
    cy.get('@passwordInput').type('asdfasdf!');
    cy.get('@checkPasswordInput').type('asdfasdf!');

    cy.get('[data-cy=PasswordLengthMessage]').as('PasswordLengthMessage');

    cy.get('@PasswordLengthMessage').should('have.text', '비밀번호는 10자 이상 입력바랍니다.');
  });

  it('비밀번호가 특수문자를 포함하지 않는 경우 메세지가 나온다.', () => {
    cy.get('@passwordInput').type('asdfasdf!');
    cy.get('@checkPasswordInput').type('asdfasdf!');

    cy.get('[data-cy=PasswordValidMessage]').as('PasswordValidMessage');

    cy.get('@PasswordValidMessage').should('have.text', '비밀번호는 영문, 숫자, 특수문자를 혼용바랍니다.');
  });
});
