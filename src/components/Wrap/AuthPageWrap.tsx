import { IChildrenProps } from '@/types/common';

const AuthPageWrap = ({ children }: IChildrenProps) => {
  return <div className="h-auth-page-height flex justify-center items-center">{children}</div>;
};

export default AuthPageWrap;
