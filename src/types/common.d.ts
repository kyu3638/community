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

export interface IUser {
  uid: string;
  email: string;
  nickName: string;
  introduction: string;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
  follower: string[];
  following: string[];
  like: string[];
}

export interface ILoginInput {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IInputsForm {
  children: ReactNode;
}

export interface IFeed {
  uid: UserUidType;
  nickName: string;
  profileImage: string;
  title: string;
  content: string;
  like: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  articleId: string;
  uid: string;
  nickName: string;
  profileImage: string;
  comment: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentsProps {
  articleId: string;
  userUid: string;
  nickName: string | undefined;
  profileImage: string | undefined;
}

export interface IParentComment extends IComment {
  commentId: string;
  children: IComment[];
}

export interface IChildCommentState {
  [id: string]: { editMode: boolean; text: string };
}

export interface IAddCommentArg {
  parentId: string | null;
}
