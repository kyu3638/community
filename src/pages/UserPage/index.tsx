// import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PageWrap from '@/components/Wrap/PageWrap';
import Profile from '@/pages/MyPage/Profile';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IUser } from '@/types/common';

const UserPage = () => {
  // const [user, setUser] = useState<IUser | null>(null);
  const { userUid } = useParams();
  console.log(`불러올 유저의 uid : `, userUid);
  console.log(useParams());

  // /** db에서 유저를 불러옴 */
  // useEffect(() => {
  //   // 렌더링 될 때 유저의 정보가 뿌려지도록..
  //   const getUser = async () => {
  //     const userRef = doc(db, 'users', userUid as string);
  //     await getDoc(userRef)
  //       .then((res) => {
  //         const userData = JSON.stringify(res.data());
  //         setUser(JSON.parse(userData));
  //         return JSON.parse(userData);
  //       })
  //       .then((user) => {
  //         console.log(`현재 조회된 유저 : `, user);
  //       });
  //   };

  //   getUser();
  // }, []);

  const fetchUser = async (): Promise<IUser | undefined> => {
    try {
      const res = await getDoc(doc(db, 'users', userUid as string));
      console.log(res);
      console.log(res.data());
      const user = res.data() as IUser;
      return user;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser, refetchOnWindowFocus: true });
  return (
    <PageWrap>
      <Profile user={user!} />
    </PageWrap>
  );
};

export default UserPage;
