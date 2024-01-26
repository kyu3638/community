import { useState } from 'react';
import { ILoginInput, IInputsForm } from '@/types/common';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/firebase';
import { UserCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { useUserUid } from '@/contexts/LoginUserState';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { updateUserUid } = useUserUid();

  const navigate = useNavigate();

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onLoginHandler = async () => {
    try {
      // 로그인, user의 uid를 userUid로 전역 상태관리, Home으로 이동
      await signInWithEmailAndPassword(auth, email, password).then((res: UserCredential) => {
        updateUserUid(res.user.uid);
        navigate('/');
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onMoveToSignUp = () => {
    navigate('/sign-up-step-one');
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
        <button onClick={onLoginHandler}>로그인</button>
        <button onClick={onMoveToSignUp}>회원가입</button>
      </div>
    </div>
  );
};

export default Login;

export const LoginInput = ({ label, type, placeholder, value, onChange }: ILoginInput) => {
  return (
    <>
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </>
  );
};

export const InputsForm = ({ children }: IInputsForm) => {
  return (
    <>
      <form className="flex flex-col">{children}</form>
    </>
  );
};
