import { DocumentData } from 'firebase/firestore';
import { ReactNode } from 'react';

export interface IChildrenProps {
  children: ReactNode;
}

export interface IUserUidContext {
  userUid: string | null;
  userData: IUser | null;
  updateUserUid: (arg: UserUidType) => void;
  isLogin: boolean;
}

type UserUidType = string | null;

export interface IUser extends DocumentData {
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
  data_cy: string;
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
  like: string[];
  createdAt: Date;
  updatedAt: Date;
  isRemoved: boolean;
}

export interface IParentComment extends IComment {
  commentId: string;
  children: IChildComment[];
}

export interface IChildComment extends IComment {
  commentId: string;
}

export interface IChildCommentState {
  [id: string]: { editMode: CommentStateMode; text: string };
}

export interface IAddCommentArg {
  parentId: string | null;
}

export interface IRemoveCommentFuncArg {
  commentId: string;
}

export interface IUpdateCommentFuncArg {
  targetCommentId: string;
  targetCommentText: string;
}

export type CommentStateMode = 'create' | 'edit' | 'view';
