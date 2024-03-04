import AvatarInCard from '@/components/Avatar/AvatarInCard';
import UserCardWrap from '@/components/Wrap/UserCardWrap';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';
import { IUser } from '@/types/common';
import { Link } from 'react-router-dom';

const UserCard = ({
  user,
  editFollow,
}: {
  user: IUser;
  editFollow: ({ userUid, targetUid, type }: { userUid: string; targetUid: string; type: string }) => void;
}) => {
  const { userUid } = useUserUid();
  const isMyProfile = user?.uid === userUid!;
  return (
    <UserCardWrap>
      <Link to={`/user/${user?.uid}`}>
        <AvatarInCard avatarImageSrc={user?.profileImage?.card} />
      </Link>
      <div>
        <div>닉네임 : {user?.nickName}</div>
        <div>팔로워 : {user?.follower?.length}</div>
        <div>팔로잉 : {user?.following?.length}</div>
        <div>소개말 : {user?.introduction}</div>
      </div>
      <div className="absolute right-3 top-3">
        {!isMyProfile && (
          <>
            {user?.follower?.includes(userUid!) ? (
              <Button
                variant={'unfollow'}
                size={'xs'}
                onClick={() => editFollow({ userUid: userUid!, targetUid: user?.uid, type: 'removeFollowing' })}
              >
                ✓팔로잉
              </Button>
            ) : (
              <Button
                variant={'follow'}
                size={'xs'}
                onClick={() => editFollow({ userUid: userUid!, targetUid: user?.uid, type: 'addFollowing' })}
              >
                팔로우
              </Button>
            )}
          </>
        )}
      </div>
    </UserCardWrap>
  );
};

export default UserCard;
