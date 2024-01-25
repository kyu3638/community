// import { useUserEmail } from '@/contexts/LoginUserState';
import { InputsForm, LoginInput } from '../Login';
import { useState } from 'react';
// import { IUser } from '@/types/common';

const SignUpStepTwo = () => {
  const [name, setName] = useState('');
  const [nickName, setNickName] = useState('');
  const [introduction, setIntroduction] = useState('');
  // const { userEmail } = useUserEmail();
  // const [userData, setUserData] = useState<IUser>();

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const onChangeNickName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickName(e.target.value);
  };
  const onChangeIntroduction = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntroduction(e.target.value);
  };

  const signUpHandler = () => {};

  return (
    <div>
      <InputsForm>
        <LoginInput
          label={'이름'}
          type={'text'}
          placeholder={'이름을 입력하세요'}
          value={name}
          onChange={onChangeName}
        />
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
