import { IChildrenProps } from '@/types/common';

const PageWrap = ({ children }: IChildrenProps) => {
  return (
    <div className="flex justify-center items-center">
     {children}
    </div>
  );
};

export default PageWrap;
