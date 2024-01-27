import { createContext, useState, useContext } from 'react';
import { IChildrenProps, IUserUidContext } from '@/types/common.ts';

const UserUidContext = createContext<IUserUidContext>({
  userUid: null,
  updateUserUid: () => {},
  isLogin: false,
});

export const useUserUid = () => useContext(UserUidContext);

export const UserUidProvider = ({ children }: IChildrenProps) => {
  const [userUid, setUserUid] = useState<string | null>(null);

  const updateUserUid = (val: string | null) => {
    setUserUid(val);
  };

  const isLogin = !!userUid;

  return <UserUidContext.Provider value={{ userUid, updateUserUid, isLogin }}>{children}</UserUidContext.Provider>;
};
