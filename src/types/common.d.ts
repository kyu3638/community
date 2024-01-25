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
  nickName: string;
  introduction: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}
