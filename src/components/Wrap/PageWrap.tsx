import { IChildrenProps } from '@/types/common';

const PageWrap = ({ children }: IChildrenProps) => {
  return <div className="flex justify-center gap-10">{children}</div>;
};

export default PageWrap;
