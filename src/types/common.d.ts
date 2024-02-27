import { DocumentData, FieldValue, Timestamp } from 'firebase/firestore';
import React, { ReactNode } from 'react';

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
  profileImage: {
    profile: string;
    card: string;
    comment: string;
  };
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  follower: string[];
  following: string[];
  like: string[];
}

export interface ILoginInput {
  label: string | React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  testId: string;
}

export interface IInputsForm {
  children: ReactNode;
}

interface uploadImage {
  base64?: string;
  url: string;
  filePath: string;
}
export interface IFeed {
  uid: UserUidType;
  nickName: string;
  profileImage: string;
  title: string;
  content: string;
  like: string[];
  images: uploadImage[];
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
}

export interface IComment {
  articleId: string;
  uid: string;
  nickName: string;
  profileImage: string;
  comment: string;
  parentId: string | null;
  like: string[];
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
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
