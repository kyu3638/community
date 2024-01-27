import { useEffect, useState } from 'react';
import { ILoginInput, IInputsForm } from '@/types/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/firebase';
import { UserCredential, browserSessionPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { useUserUid } from '@/contexts/LoginUserState';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { updateUserUid } = useUserUid();

  const location = useLocation();
  const from = location?.state?.redirectedFrom?.pathname || '/';
  useEffect(() => {
    if (from === '/') {
      console.log('Home에서 왔거나 최초 접속 입니다.');
    } else {
      console.log(`로그인 없이 ${from}에 접속하려 했습니다.`);
    }
  }, []);
  const navigate = useNavigate();

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onLoginHandler = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence)
        .then(() => {
          return signInWithEmailAndPassword(auth, email, password);
        })
        .then((res: UserCredential) => {
          updateUserUid(res.user.uid);
          navigate(from);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const onMoveToSignUp = () => {
    navigate('/sign-up-step-one');
  };

  /** 로그인 상태에서 접근되면 안되는 페이지들에서 내보내기 */
  useEffect(() => {
    const _session_key = `firebase:authUser:${import.meta.env.VITE_FIREBASE_API_KEY}:[DEFAULT]`;
    const sessionData = sessionStorage.getItem(_session_key);
    if (sessionData) {
      const uid = JSON.parse(sessionData).uid;
      updateUserUid(uid);
      console.log(`접속 정보가 있으므로 ${from} 으로 이동합니다.`);
      navigate(from);
    }
  }, []);

  return (
    <div className="h-full flex flex-col justify-center items-center">
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
