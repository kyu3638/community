import { useState } from 'react';
import { InputsForm, LoginInput } from '../Login';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  const onChangeEmail = () => {
    setEmail(email);
  };
  const onChangePassword = () => {
    setPassword(password);
  };
  const onChangeCheckPassword = () => {
    setCheckPassword(checkPassword);
  };

  return (
    <div className="h-lvh flex flex-col justify-center items-center">
      <div>회원가입</div>
      <InputsForm>
        <LoginInput
          label={'이메일'}
          type={'text'}
          placeholder={'이메일을 입력하세요'}
          value={email}
          onChange={onChangeEmail}
        />
        <LoginInput
          label={'이메일'}
          type={'password'}
          placeholder={'비밀번호를 입력하세요'}
          value={password}
          onChange={onChangePassword}
        />
        <LoginInput
          label={'이메일'}
          type={'password'}
          placeholder={'비밀번호 확인을 입력하세요'}
          value={password}
          onChange={onChangeCheckPassword}
        />
      </InputsForm>
      <div className="flex flex-col gap-2">
        <button>다음</button>
      </div>
    </div>
  );
};

export default SignUp;
