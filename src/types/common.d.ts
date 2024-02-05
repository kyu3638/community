import { ReactNode } from 'react';

export interface IChildrenProps {
  children: ReactNode;
}

export interface IUserUidContext {
  userUid: UserUidType;
  updateUserUid: (arg: UserUidType) => void;
  isLogin: boolean;
}

type UserUidType = string | null;

interface IUser {
  uid: string;
  email: string;
  nickName: string;
  introduction: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
  follower: string[];
  following: string[];
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

interface IFeed {
  uid: UserUidType;
  nickName: string;
  profileImage: string;
  title: string;
  content: string;
  comments: IComment[];
  like: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IComment {
  uid: UserUidType;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
