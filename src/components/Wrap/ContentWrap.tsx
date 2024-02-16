import { IChildrenProps } from '@/types/common';

const ContentWrap = ({ children }: IChildrenProps) => {
  return (
    <div className="w-[700px]  my-[10px] p-[30px] rounded-md flex flex-col gap-10">{children}</div>
  );
};

export default ContentWrap;
