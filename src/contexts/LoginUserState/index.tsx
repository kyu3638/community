import { createContext, useState, useContext } from 'react';
import { IChildrenProps, IUserUidContext } from '@/types/common.ts';

const UserUidContext = createContext<IUserUidContext>({
  userUid: '',
  updateUserUid: () => {},
  isLogin: false,
});

export const useUserUid = () => useContext(UserUidContext);

export const UserUidProvider = ({ children }: IChildrenProps) => {
  const [userUid, setUserUid] = useState('');

  const updateUserUid = (val: string) => {
    setUserUid(val);
  };

  const isLogin = !!userUid;

  return <UserUidContext.Provider value={{ userUid, updateUserUid, isLogin }}>{children}</UserUidContext.Provider>;
};
