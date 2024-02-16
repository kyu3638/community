import { fetchFollowing } from '@/apis/user/users';
import { useUserUid } from '@/contexts/LoginUserState';
import { useQueries, useQuery } from '@tanstack/react-query';

const DetailInfo = ({ mode }: { mode: string }) => {
  const { userData } = useUserUid();
  const userfollowing = userData?.following;

  const resultFollowing = useQueries({
    queries:
      userfollowing?.map((uid) => ({
        queryKey: ['following', uid],
        queryFn: () => fetchFollowing(uid),
        staletime: Infinity,
      })) || [],
  });

  return (
    <div className="border border-black">
      {resultFollowing.map((doc, index) => {
        const user = doc.data;
        console.log(user);
        return <div key={index}>{user?.nickName}</div>;
      })}
    </div>
  );
};

export default DetailInfo;
