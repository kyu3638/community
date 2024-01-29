import { useEffect, useState } from 'react';
import { ILoginInput, IInputsForm, IUser } from '@/types/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db, provider } from '@/firebase/firebase';
import {
  UserCredential,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { useUserUid } from '@/contexts/LoginUserState';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

  /** 구글 로그인 */
  const onLoginOAuth = async () => {
    try {
      // session storage에 인증 상태를 저장
      await setPersistence(auth, browserSessionPersistence)
        .then(() => {
          return signInWithPopup(auth, provider);
        })
        .then((result) => {
          GoogleAuthProvider.credentialFromResult(result);
          return result;
        })
        .then((res: UserCredential) => {
          updateUserUid(res.user.uid);
          return res.user;
        })
        // 이후 신규 유저인지 기존 유저인지 확인하는 과정
        .then((user) => {
          // 유저 정보가 DB에 저장되어있는지를 확인
          const docRef = doc(db, 'users', user.uid);
          return getDoc(docRef);
        })
        .then((res) => {
          // 기존 유저 정보가 있는 경우 -> 홈
          // 새로 가입한 유저 -> 회원가입 2단계
          if (res.exists()) {
            console.log(`소셜로그인, 기존 유저이기 때문에 홈으로 이동`);
            navigate('/');
          } else {
            onAuthStateChanged(auth, (user) => {
              const newUser: IUser = {
                uid: user?.uid as string,
                email: user?.email as string,
                nickName: '',
                introduction: '',
                profileImage: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                like: [],
                follower: [],
                following: [],
              };
              setDoc(doc(db, 'users', user?.uid as string), newUser);
              console.log(`소셜로그인, 신규 유저이기 때문에 회원가입 2단계로 이동`);
              navigate('/sign-up-step-two');
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
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
        <button onClick={onLoginOAuth}>구글 로그인</button>
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
