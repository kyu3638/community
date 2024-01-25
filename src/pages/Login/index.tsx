import { ReactNode, useState } from 'react';

interface ILoginInput {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: () => void;
}

interface IInputsForm {
  children: ReactNode;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onChangeEmail = () => {
    setEmail(email);
  };
  const onChangePassword = () => {
    setPassword(password);
  };

  return (
    <div className="h-lvh flex flex-col justify-center items-center">
      <div>로그인</div>
      <InputsForm>
        <LoginInput
          label={'이메일'}
          type={'text'}
          placeholder={'이메일을 입력하세요'}
          value={email}
          onChange={onChangeEmail}
        />
        <LoginInput
          label={'비밀번호'}
          type={'password'}
          placeholder={'비밀번호를 입력하세요'}
          value={password}
          onChange={onChangePassword}
        />
      </InputsForm>
      <div className="flex flex-col gap-2">
        <button>로그인</button>
        <button>회원가입</button>
      </div>
    </div>
  );
};

export default Login;

const LoginInput = ({ label, type, placeholder, value, onChange }: ILoginInput) => {
  return (
    <>
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </>
  );
};

const InputsForm = ({ children }: IInputsForm) => {
  return (
    <>
      <form className="flex flex-col">{children}</form>
    </>
  );
};
