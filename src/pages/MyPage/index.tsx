import PageWrap from '@/components/Wrap/PageWrap';
import Profile from './components/Profile';
import { useUser } from '@/hooks/useUser';
import { IUser } from '@/types/common';
import { useParams } from 'react-router';
import Metadatas from '@/metadatas/Metadatas';

const MyPage = () => {
  const { userUid: targetUserUid } = useParams();

  const { data: targetUserData } = useUser(targetUserUid!);

  return (
    <PageWrap>
      <Metadatas title={`마이페이지`} desc={`코드숲 마이페이지입니다.`} />
      <Profile user={targetUserData as IUser} />
    </PageWrap>
  );
};

export default MyPage;
