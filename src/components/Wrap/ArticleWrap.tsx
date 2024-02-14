import { IChildrenProps } from '@/types/common';

const ArticleWrap = ({ children }: IChildrenProps) => {
  return <div className="flex flex-col gap-5 border border-indigo-500 bg-indigo-50 shadow-lg p-5">{children}</div>;
};

export default ArticleWrap;
