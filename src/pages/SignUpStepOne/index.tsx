import React, { useEffect, useState } from 'react';
import { LoginInput } from '@/pages/Login';
import {
  UserCredential,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
} from 'firebase/auth';
import { auth, db } from '@/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { IUser } from '@/types/common';
import { useUserUid } from '@/contexts/LoginUserState';
import AuthPageWrap from '@/components/Wrap/AuthPageWrap';
import { RiLockPasswordFill } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa';

const SignUpStepOne = () => {
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');
  const [passwordLengthMessage, setPasswordLengthMessage] = useState('');
  const [passwordSameMessage, setPasswordSameMessage] = useState('');
  const [passwordValidMessage, setPasswordValidMessage] = useState('');
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);
  const [isPasswordSameValid, setIsPasswordSameValid] = useState(false);
  const [isPasswordValidValid, setIsPasswordValidValid] = useState(false);

  const isStepOneValid = () => {
    return password.length >= 10 && checkPassword.length >= 10;
  };

  // 전역 관리할 유저 메일을 업데이트할 setter
  const { updateUserUid } = useUserUid();

  const navigate = useNavigate();

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  /** 이메일 유효성 검사 */
  useEffect(() => {
    const emailRegExp = /^[A-Za-z0-9_]+[A-Za-z0-9]*[@]{1}[A-Za-z0-9]+[A-Za-z0-9]*[.]{1}[A-Za-z]{1,}$/;
    if (!email) {
      setEmailMessage('');
    } else {
      if (!emailRegExp.test(email)) {
        setEmailMessage('이메일 형식이 올바르지 않습니다.');
        setIsEmailValid(false);
      } else {
        setEmailMessage('이메일 형식이 유효합니다.');
        setIsEmailValid(true);
      }
    }
  }, [email]);

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const onChangeCheckPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckPassword(e.target.value);
  };
  useEffect(() => {
    const pwCheck = /^(?!((?:[A-Za-z]+)|(?:[~!@#$%^&*()_+=]+)|(?:[0-9]+))$)[A-Za-z\d~!@#$%^&*()_+=]{10,}$/;
    if (!password.length && !checkPassword.length) {
      setPasswordValidMessage('');
      setPasswordLengthMessage('');
      setPasswordSameMessage('');
    } else {
      if (!pwCheck.test(password) || !pwCheck.test(checkPassword)) {
        setPasswordValidMessage('비밀번호는 영문, 숫자, 특수문자를 혼용바랍니다.');
        setIsPasswordValidValid(false);
      } else {
        setPasswordValidMessage('');
        setIsPasswordValidValid(true);
      }
      if (password.length < 10 || checkPassword.length < 10) {
        setPasswordLengthMessage('비밀번호는 10자 이상 입력바랍니다.');
        setIsPasswordLengthValid(false);
      } else {
        setPasswordLengthMessage('');
        setIsPasswordLengthValid(true);
      }
      if (password !== checkPassword) {
        setPasswordSameMessage('비밀번호가 일치하지 않습니다.');
        setIsPasswordSameValid(false);
      } else {
        setPasswordSameMessage('');
        setIsPasswordSameValid(true);
      }
    }
  }, [password, checkPassword]);

  const signUpHandler = async () => {
    /** 비밀번호가 유효한지 체크하는 함수 */
    if (isValid(password, checkPassword)) {
      try {
        await setPersistence(auth, browserSessionPersistence)
          .then(() => {
            return createUserWithEmailAndPassword(auth, email, password);
          })
          .then((res: UserCredential) => {
            console.log(`${res.user.email}님의 회원가입 1단계가 완료되었습니다.`);
            console.log(`회원가입 2단계로 이동합니다.`);
            updateUserUid(res.user.uid);
            return res.user.uid;
          })
          .then((uid) => {
            console.log(`userId : ${uid}`);
            const newUser: IUser = {
              uid: uid,
              email: email,
              nickName: '',
              introduction: '',
              profileImage: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              follower: [],
              following: [],
              like: [],
            };
            setDoc(doc(db, 'users', uid), newUser);
            navigate('/sign-up-step-two');
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <AuthPageWrap>
      <div className="flex flex-col justify-center items-center gap-5 w-[350px]">
        <div className="text-xl font-extrabold">회원가입 step 1</div>
        <div>
          <LoginInput
            label={<FaUser />}
            type={'text'}
            placeholder={'이메일을 입력하세요'}
            value={email}
            onChange={onChangeEmail}
            testId="emailInput"
          />
          <span data-cy='isEmailValidMessage' className={`${isEmailValid ? 'text-[#4cd964]' : 'text-[#ff3b30]'} text-sm font-semibold`}>
            {emailMessage}
          </span>
        </div>
        <div>
          <LoginInput
            label={<RiLockPasswordFill />}
            type={'password'}
            placeholder={'비밀번호를 입력하세요'}
            value={password}
            onChange={onChangePassword}
            testId="passwordInput"
          />
          <LoginInput
            label={<RiLockPasswordFill />}
            type={'password'}
            placeholder={'비밀번호 확인을 입력하세요'}
            value={checkPassword}
            onChange={onChangeCheckPassword}
            testId="checkPasswordInput"
          />
        </div>
        <div className="flex flex-col">
          <span data-cy='PasswordValidMessage' className={`${isPasswordValidValid ? 'text-[#4cd964]' : 'text-[#ff3b30]'} text-sm font-semibold`}>
            {passwordValidMessage}
          </span>
          <span data-cy='PasswordLengthMessage' className={`${isPasswordLengthValid ? 'text-[#4cd964]' : 'text-[#ff3b30]'} text-sm font-semibold`}>
            {passwordLengthMessage}
          </span>
          <span data-cy='PasswordSameMessage' className={`${isPasswordSameValid ? 'text-[#4cd964]' : 'text-[#ff3b30]'} text-sm font-semibold`}>
            {passwordSameMessage}
          </span>
        </div>
        <button
          className={`${
            isStepOneValid() ? 'bg-[#0F172A] text-white' : 'bg-[#F2F2F2] text-black'
          }  px-5 py-2 rounded-sm text-sm cursor-pointer`}
          onClick={signUpHandler}
          disabled={!isStepOneValid()}
        >
          다음
        </button>
      </div>
    </AuthPageWrap>
  );
};

export default SignUpStepOne;

export const isValid = (pw: string, checkPw: string) => {
  if (pw === checkPw) {
    const pwCheck = /^(?!((?:[A-Za-z]+)|(?:[~!@#$%^&*()_+=]+)|(?:[0-9]+))$)[A-Za-z\d~!@#$%^&*()_+=]{10,}$/.test(pw);
    if (pwCheck) {
      console.log(`비밀번호가 10자리 이상이고 영문, 숫자, 특수문자 중 2가지 이상 조합으로 유효합니다.`);
      return true;
    } else {
      alert('비밀번호는 10자 이상, 영어 대문자, 소문자, 숫자, 특수문자 중 2종류 문자 조합으로 설정바랍니다.');
      return false;
    }
  } else {
    alert('비밀번호, 비밀번호 확인이 일치하지 않습니다.');
    return false;
  }
};
