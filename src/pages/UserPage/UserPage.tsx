import { IUser } from '@/types/common';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PageWrap from '@/components/Wrap/PageWrap';
import Profile from '@/pages/MyPage/Profile';
import { useParams } from 'react-router-dom';

const UserPage = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const { userUid } = useParams();
  console.log(userUid);
  /** db에서 유저를 불러옴 */
  useEffect(() => {
    // 렌더링 될 때 유저의 정보가 뿌려지도록..
    const getUser = async () => {
      const userRef = doc(db, 'users', userUid as string);
      await getDoc(userRef)
        .then((res) => {
          const userData = JSON.stringify(res.data());
          setUser(JSON.parse(userData));
          return JSON.parse(userData);
        })
        .then((user) => {
          console.log(`현재 조회된 유저 : `, user);
        });
    };
    getUser();
  }, []);

  return (
    <PageWrap>
      <Profile user={user!} />
    </PageWrap>
  );
};

export default UserPage;
