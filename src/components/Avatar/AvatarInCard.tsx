import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from '../ui/avatar';

interface IAvatarImageSrc {
  avatarImageSrc: string | undefined;
}

const AvatarInCard = ({ avatarImageSrc }: IAvatarImageSrc) => {
  return (
    <Avatar className="w-20 h-20">
      <AvatarImage src={avatarImageSrc} />
    </Avatar>
  );
};

export default AvatarInCard;
