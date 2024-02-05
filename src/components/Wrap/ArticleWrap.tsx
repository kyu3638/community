import { IChildrenProps } from '@/types/common';

const ArticleWrap = ({ children }: IChildrenProps) => {
  return <div className="flex flex-col border-black border-2 rounded p-5">{children}</div>;
};

export default ArticleWrap;
