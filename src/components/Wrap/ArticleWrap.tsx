import { IChildrenProps } from '@/types/common';

const ArticleWrap = ({ children }: IChildrenProps) => {
  return <div className="flex flex-col gap-5 border border-blue-500 bg-blue-100 p-5">{children}</div>;
};

export default ArticleWrap;
