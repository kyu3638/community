import React, { useState } from 'react';
import { InputsForm, LoginInput } from '@/pages/Login';
import { UserCredential, createUserWithEmailAndPassword } from 'firebase/auth';
import { authService, db } from '@/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { IUser } from '@/types/common';
import { useUserEmail } from '@/contexts/LoginUserState';

const SignUpStepOne = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  // 전역 관리할 유저 메일을 업데이트할 setter
  const { updateUserEmail } = useUserEmail();

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
    try {
      await createUserWithEmailAndPassword(authService, email, password)
        .then((res: UserCredential) => {
          console.log(res);
          console.log(`${res.user.email}님의 회원가입 1단계가 완료되었습니다.`);
          console.log(`회원가입 2단계로 이동합니다.`);
          // 가입한 유저의 email 전역 상태 관리
          const newUser: IUser = {
            email: email,
            nickName: '',
            introduction: '',
            profileImage: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const docRef = addDoc(collection(db, 'users'), newUser);
          return docRef;
        })
        .then((res) => {
          const userId = res.id;
          updateUserEmail(userId);
          navigate('/sign-up-step-two');
        });
    } catch (error) {
      console.log(error);
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
