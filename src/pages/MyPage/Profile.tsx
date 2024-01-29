import { IUser } from '@/types/common';
import ContentWrap from '@/components/Wrap/ContentWrap';
import AvatarInProfile from '@/components/Avatar/AvatarInProfile';
import { Avatar } from '@/components/ui/avatar';

interface IUserProps {
  user: IUser | null;
}

const Profile = ({ user }: IUserProps) => {
  if (user) {
    return (
      <ContentWrap>
        <Avatar className="w-48 h-48">
          <AvatarInProfile avatarImageSrc={user.profileImage} />
        </Avatar>
        <div>닉네임 : {user.nickName}</div>
        <div>소개말 : {user.introduction}</div>
      </ContentWrap>
    );
  }
};

export default Profile;
