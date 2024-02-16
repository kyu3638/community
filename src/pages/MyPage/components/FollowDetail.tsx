import { fetchFollowing } from '@/apis/user/users';
import { useUserUid } from '@/contexts/LoginUserState';
import { useQueries } from '@tanstack/react-query';
import UserCard from '../../SearchUser/UserCard';
import { useFollow } from '@/hooks/useFollow';
import { useUser } from '@/hooks/useUser';

const FollowDetail = ({ mode }: { mode: string }) => {
  const { userUid } = useUserUid();
  const { data: userData } = useUser(userUid!);

  const { mutate: editFollow } = useFollow();
  const userToShow = mode === 'following' ? userData?.following : userData?.follower;

  const resultFollowing = useQueries({
    queries:
      userToShow?.map((uid: string) => ({
        queryKey: [mode, uid],
        queryFn: () => fetchFollowing(uid),
        staletime: Infinity,
      })) || [],
  });

  return (
    <div>
      {resultFollowing.map((doc, index) => {
        const user = doc.data;
        return <UserCard key={index} user={user} editFollow={editFollow} />;
      })}
    </div>
  );
};

export default FollowDetail;
