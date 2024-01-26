import React, { useState } from 'react';
import { InputsForm, LoginInput } from '@/pages/Login';
import { UserCredential, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { IUser } from '@/types/common';
import { useUserUid } from '@/contexts/LoginUserState';

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
    const isValid = (pw: string, checkPw: string) => {
      if (pw === checkPw) {
        const pwCheck = /^(?!((?:[A-Za-z]+)|(?:[~!@#$%^&*()_+=]+)|(?:[0-9]+))$)[A-Za-z\d~!@#$%^&*()_+=]{10,}$/.test(pw);
        if (pwCheck) {
          console.log(`비밀번호가 10자리 이상이고 영문, 숫자, 특수문자 중 2가지 이상 조합으로 유효합니다.`);
          return true;
        } else {
          alert('비밀번호는 영어 대문자, 소문자, 숫자, 특수문자 중 2종류 문자 조합으로 설정바랍니다.');
          return false;
        }
      } else {
        alert('비밀번호, 비밀번호 확인이 일치하지 않습니다.');
        return false;
      }
    };
    if (isValid(password, checkPassword)) {
      try {
        await createUserWithEmailAndPassword(auth, email, password)
          .then((res: UserCredential) => {
            console.log(`res : `, res);
            console.log(`${res.user.email}님의 회원가입 1단계가 완료되었습니다.`);
            console.log(`회원가입 2단계로 이동합니다.`);
            updateUserUid(res.user.uid);
            return res.user.uid;
          })
          .then((uid) => {
            console.log(`userId : ${uid}`);
            const newUser: IUser = {
              email: email,
              nickName: '',
              introduction: '',
              profileImage: '',
              createdAt: new Date(),
              updatedAt: new Date(),
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
    <div className="h-lvh flex flex-col justify-center items-center">
      <div>회원가입 step 1</div>
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
        <LoginInput
          label={'비밀번호 확인'}
          type={'password'}
          placeholder={'비밀번호 확인을 입력하세요'}
          value={checkPassword}
          onChange={onChangeCheckPassword}
        />
      </InputsForm>
      <div className="flex flex-col gap-2">
        <button onClick={signUpHandler}>다음</button>
      </div>
    </div>
  );
};

export default SignUpStepOne;
