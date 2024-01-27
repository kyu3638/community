import { IChildrenProps } from '@/types/common';

const ContentWrap = ({ children }: IChildrenProps) => {
  return <div className="w-[700px] border-black border-2 my-[10px] p-[10px] rounded-md">{children}</div>;
};

export default ContentWrap;
