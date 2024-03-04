import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PageWrap from '@/components/Wrap/PageWrap';
import Profile from '@/pages/MyPage/components/Profile';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IUser } from '@/types/common';

const UserPage = () => {
  const { userUid } = useParams();
  console.log(`불러올 유저의 uid : `, userUid);

  const fetchUser = async (): Promise<IUser | undefined> => {
    try {
      const res = await getDoc(doc(db, 'users', userUid as string));
      const user = res.data() as IUser;
      return user;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return (
    <PageWrap>
      <Profile user={user!} />
    </PageWrap>
  );
};

export default UserPage;
