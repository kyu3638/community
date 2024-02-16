import { IChildrenProps } from '@/types/common';

const UserCardWrap = ({ children }: IChildrenProps) => {
  return (
    <div className="border-black border-t border-b my-[10px] p-[10px] pl-5 relative flex items-center gap-10 bg-gray-100 ">
      {children}
    </div>
  );
};

export default UserCardWrap;
