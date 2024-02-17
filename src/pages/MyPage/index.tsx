import PageWrap from '@/components/Wrap/PageWrap';
import Profile from './components/Profile';
import { useUser } from '@/hooks/useUser';
import { IUser } from '@/types/common';
import { useParams } from 'react-router';

const MyPage = () => {
  const { userUid: targetUserUid } = useParams();

  const { data: targetUserData } = useUser(targetUserUid!);

  return (
    <PageWrap>
      <Profile user={targetUserData as IUser} />
    </PageWrap>
  );
};

export default MyPage;
