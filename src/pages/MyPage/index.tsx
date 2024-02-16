import { useUserUid } from '@/contexts/LoginUserState';
import PageWrap from '@/components/Wrap/PageWrap';
import Profile from './components/Profile';
import { useUser } from '@/hooks/useUser';
import { IUser } from '@/types/common';

const MyPage = () => {
  const { userUid } = useUserUid();
  const { data: userData } = useUser(userUid!);

  return (
    <PageWrap>
      <Profile user={userData as IUser} />
    </PageWrap>
  );
};

export default MyPage;
