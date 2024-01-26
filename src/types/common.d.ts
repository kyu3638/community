import { ReactNode } from 'react';

export interface IChildrenProps {
  children: ReactNode;
}

export interface IUserUidContext {
  userUid: string;
  updateUserUid: (arg: string) => void;
  isLogin: boolean;
}

interface IUser {
  email: string;
  nickName: string;
  introduction: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ILoginInput {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface IInputsForm {
  children: ReactNode;
}
