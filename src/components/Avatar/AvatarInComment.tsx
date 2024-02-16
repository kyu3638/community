import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from '../ui/avatar';

interface IAvatarImageSrc {
  avatarImageSrc: string | undefined;
}

const AvatarInComment = ({ avatarImageSrc }: IAvatarImageSrc) => {
  return (
    <Avatar className="w-12 h-12">
      <AvatarImage src={avatarImageSrc} />
    </Avatar>
  );
};

export default AvatarInComment;
