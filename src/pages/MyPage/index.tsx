import { useUserUid } from '@/contexts/LoginUserState';
import PageWrap from '@/components/Wrap/PageWrap';
import Profile from './Profile';

const MyPage = () => {
  const { userData } = useUserUid();

  return (
    <PageWrap>
      <Profile user={userData} />
    </PageWrap>
  );
};

export default MyPage;
