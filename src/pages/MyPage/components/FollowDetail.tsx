import { fetchFollowing } from '@/apis/user/users';
import { useUserUid } from '@/contexts/LoginUserState';
import { useQueries } from '@tanstack/react-query';
import { useFollow } from '@/hooks/useFollow';
import { useUser } from '@/hooks/useUser';
import UserCard from '@/pages/SearchUser/UserCard';
import { useParams } from 'react-router';

const FollowDetail = ({ mode }: { mode: string }) => {
  // const { userUid } = useUserUid();
  // console.log(`userUid`, userUid);
  // const { data: userData } = useUser(userUid!);

  const { userUid: targetUserUid } = useParams();
  console.log(`targetUserUid`, targetUserUid);
  const { data: targetUserData } = useUser(targetUserUid!);
  console.log(`targetUserData`, targetUserData);

  const { mutate: editFollow } = useFollow();
  const userToShow = mode === 'following' ? targetUserData?.following : targetUserData?.follower;
  console.log(userToShow);

  const resultFollowing = useQueries({
    queries:
      userToShow?.map((uid: string) => ({
        queryKey: [mode, uid],
        queryFn: () => fetchFollowing(uid),
        staletime: Infinity,
      })) || [],
  });

  return (
    <div className="border border-black">
      {resultFollowing.map((doc, index) => {
        const user = doc.data;
        return <UserCard key={index} user={user} editFollow={editFollow} />;
      })}
    </div>
  );
};

export default FollowDetail;
