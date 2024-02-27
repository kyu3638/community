import { IChildrenProps } from '@/types/common';

const ContentWrap = ({ children }: IChildrenProps) => {
  return (
    <div className="w-[700px]  my-[10px] p-[30px] rounded-3xl shadow-xl flex flex-col gap-5 bg-white">{children}</div>
  );
};

export default ContentWrap;
