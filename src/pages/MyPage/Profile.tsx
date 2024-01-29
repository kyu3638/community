import { IUser } from '@/types/common';
import React from 'react';

interface IUserProps {
  user: IUser | null;
}

const Profile = ({ user }: IUserProps) => {
  return (
    <>
      <img src={user?.profileImage} />
      <div>{user?.email}</div>
      <div>{user?.nickName}</div>
      <div>{user?.introduction}</div>
    </>
  );
};

export default Profile;
