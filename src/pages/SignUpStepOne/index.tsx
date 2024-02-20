import React, { useState } from 'react';
import { InputsForm, LoginInput } from '@/pages/Login';
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
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  // 전역 관리할 유저 메일을 업데이트할 setter
  const { updateUserUid } = useUserUid();

  const navigate = useNavigate();

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const onChangeCheckPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckPassword(e.target.value);
  };

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
        <LoginInput
          label={<FaUser />}
          type={'text'}
          placeholder={'이메일을 입력하세요'}
          value={email}
          onChange={onChangeEmail}
          testId="emailInput"
        />
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
          testId="confirmPasswordInput"
        />
        <button className="bg-[#0F172A] px-5 py-2 rounded-sm text-sm text-white" onClick={signUpHandler}>
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
