import { createContext, useState, useContext, useEffect } from 'react';
import { IChildrenProps, IUser, IUserUidContext } from '@/types/common.ts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const UserUidContext = createContext<IUserUidContext>({
  userUid: null,
  userData: null,
  updateUserUid: () => {},
  isLogin: false,
});

export const useUserUid = () => useContext(UserUidContext);

export const UserUidProvider = ({ children }: IChildrenProps) => {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);

  const updateUserUid = (val: string | null) => {
    setUserUid(val);
  };

  const isLogin = !!userUid;

  useEffect(() => {
    const fetchUser = async () => {
      const userDocRef = doc(db, 'users', userUid!);
      const response = (await getDoc(userDocRef)).data();
      setUserData(response as IUser);
    };
    if (userUid) fetchUser();
  }, [userUid]);

  return (
    <UserUidContext.Provider value={{ userUid, userData, updateUserUid, isLogin }}>{children}</UserUidContext.Provider>
  );
};
