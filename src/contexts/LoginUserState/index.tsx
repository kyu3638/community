import { createContext, useState, useContext } from 'react';
import { IChildrenProps, IUserEmailContext } from '@/types/common.ts';

const UserEmailContext = createContext<IUserEmailContext>({
  userEmail: '',
  updateUserEmail: () => {},
});

export const useUserEmail = () => useContext(UserEmailContext);

export const UserEmailProvider = ({ children }: IChildrenProps) => {
  const [userEmail, setUserEmail] = useState('');

  const updateUserEmail = (val: string) => {
    setUserEmail(val);
  };

  return <UserEmailContext.Provider value={{ userEmail, updateUserEmail }}>{children}</UserEmailContext.Provider>;
};
