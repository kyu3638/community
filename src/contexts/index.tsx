import { UserUidProvider } from '@/contexts/LoginUserState';
import { IChildrenProps } from '@/types/common';

export const CombinedProvider = ({ children }: IChildrenProps) => {
  return <UserUidProvider>{children}</UserUidProvider>;
};
