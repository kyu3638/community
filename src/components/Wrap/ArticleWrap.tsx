import { IChildrenProps } from '@/types/common';

const ArticleWrap = ({ children }: IChildrenProps) => {
  return <div className="flex flex-col gap-5 border-t border-b border-black bg-gray-100 shadow-lg p-5">{children}</div>;
};

export default ArticleWrap;
