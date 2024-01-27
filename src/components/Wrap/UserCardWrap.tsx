import { IChildrenProps } from '@/types/common';

const UserCardWrap = ({ children }: IChildrenProps) => {
  return <div className="border-black border-2 my-[10px] p-[10px] rounded-md">{children}</div>;
};

export default UserCardWrap;
