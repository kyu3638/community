import { ReactNode } from 'react';

export interface IChildrenProps {
  children: ReactNode;
}

export interface IUserEmailContext {
  userEmail: string;
  updateUserEmail: (arg: string) => void;
}

interface IUser {
  email: string;
  name: string;
  nickName: string;
  introduction: string;
  profilePic: string;
}
