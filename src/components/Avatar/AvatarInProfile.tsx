import { AvatarImage } from '@radix-ui/react-avatar';

interface IAvatarImageSrc {
  avatarImageSrc: string | undefined;
}

const AvatarInProfile = ({ avatarImageSrc }: IAvatarImageSrc) => {
  return <AvatarImage src={avatarImageSrc} />;
};

export default AvatarInProfile;
