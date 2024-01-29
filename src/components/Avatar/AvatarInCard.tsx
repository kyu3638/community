import { AvatarImage } from '@radix-ui/react-avatar';

interface IAvatarImageSrc {
  avatarImageSrc: string | undefined;
}

const AvatarInCard = ({ avatarImageSrc }: IAvatarImageSrc) => {
  return <AvatarImage src={avatarImageSrc} />;
};

export default AvatarInCard;
