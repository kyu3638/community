import { IUser } from '@/types/common';
import ContentWrap from '@/components/Wrap/ContentWrap';
import AvatarInProfile from '@/components/Avatar/AvatarInProfile';
import { Avatar } from '@/components/ui/avatar';

interface IUserProps {
  user: IUser | null;
}

const Profile = ({ user }: IUserProps) => {
  return (
    <ContentWrap>
      <div className="flex gap-10">
        <Avatar className="w-48 h-48">
          <AvatarInProfile avatarImageSrc={user?.profileImage} />
        </Avatar>
        <div>
          <div>닉네임 : {user?.nickName}</div>
          <div>소개말 : {user?.introduction}</div>
          <div>좋아요 : {user?.like.length}</div>
          <div>팔로워 : {user?.follower.length}</div>
          <div>팔로잉 : {user?.following.length}</div>
        </div>
      </div>
      <div className="flex gap-10">
        <div>팔로워</div>
        <div>팔로잉</div>
        <div>내가 쓴 글</div>
        <div>내가 쓴 댓글</div>
      </div>
    </ContentWrap>
  );
};

export default Profile;
