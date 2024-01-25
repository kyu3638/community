import { useUserEmail } from '@/contexts/LoginUserState';
import { doc, updateDoc } from 'firebase/firestore';
import { InputsForm, LoginInput } from '../Login';
import { useState } from 'react';
import { db } from '@/firebase/firebase';
import { useNavigate } from 'react-router-dom';
// import { IUser } from '@/types/common';

const SignUpStepTwo = () => {
  const [nickName, setNickName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const { userEmail } = useUserEmail();

  const navigate = useNavigate();

  const onChangeNickName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickName(e.target.value);
  };
  const onChangeIntroduction = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntroduction(e.target.value);
  };

  const signUpHandler = async () => {
    // 작성한 것들이 유효한지 확인

    // db업데이트
    const userUpdate = async () => {
      try {
        const newData = { nickName: nickName, introduction: introduction, updatedAt: new Date() };
        const docRef = doc(db, 'users', userEmail);
        await updateDoc(docRef, newData).then(() => {
          console.log(`유저 정보가 업데이트 되었습니다.`);
          navigate('/');
        });
      } catch (error) {
        console.log(error);
      }
    };
    userUpdate();
  };

  return (
    <div className="h-lvh flex flex-col justify-center items-center">
      <InputsForm>
        <LoginInput
          label={'닉네임'}
          type={'text'}
          placeholder={'닉네임을 입력하세요'}
          value={nickName}
          onChange={onChangeNickName}
        />
        <LoginInput
          label={'인사말'}
          type={'text'}
          placeholder={'인사말을 입력하세요'}
          value={introduction}
          onChange={onChangeIntroduction}
        />
      </InputsForm>
      <div className="flex flex-col gap-2">
        <button onClick={signUpHandler}>완료</button>
      </div>
    </div>
  );
};

export default SignUpStepTwo;
