import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from '../ui/avatar';

interface IAvatarImageSrc {
  avatarImageSrc: string | undefined;
}

const AvatarInSignUp = ({ avatarImageSrc }: IAvatarImageSrc) => {
  return (
    <Avatar className="w-[200px] h-[200px]">
      <AvatarImage src={avatarImageSrc} />
    </Avatar>
  );
};

export default AvatarInSignUp;
