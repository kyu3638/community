import { fetchFollowing } from '@/apis/user/users';
import { useQueries } from '@tanstack/react-query';
import { useFollow } from '@/hooks/useFollow';
import { useUser } from '@/hooks/useUser';
import UserCard from '@/pages/SearchUser/UserCard';
import { useParams } from 'react-router';
import { IUser } from '@/types/common';

const FollowDetail = ({ mode }: { mode: string }) => {
  const { userUid: targetUserUid } = useParams();
  const { data: targetUserData } = useUser(targetUserUid!);

  const { mutate: editFollow } = useFollow();
  const userToShow = mode === 'following' ? targetUserData?.following : targetUserData?.follower;
  console.log(userToShow);

  const resultFollowing = useQueries({
    queries:
      userToShow?.map((uid: string) => ({
        queryKey: [mode, uid],
        queryFn: () => fetchFollowing(uid),
        staleTime: 1 * 60 * 1000,
      })) || [],
  });

  return (
    <>
      {resultFollowing.map((doc, index) => {
        const user = doc.data as IUser;
        return <UserCard key={index} user={user} editFollow={editFollow} />;
      })}
    </>
  );
};

export default FollowDetail;
