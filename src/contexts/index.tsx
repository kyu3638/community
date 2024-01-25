import { UserEmailProvider } from '@/contexts/LoginUserState';
import { IChildrenProps } from '@/types/common';

export const CombinedProvider = ({ children }: IChildrenProps) => {
  return <UserEmailProvider>{children}</UserEmailProvider>;
};
