import { IChildrenProps } from '@/types/common';

const EditorWrap = ({ children }: IChildrenProps) => {
  return (
    <div className="w-[700px] border-black border-2 my-[10px] p-[30px] rounded-md flex flex-col gap-10">{children}</div>
  );
};

export default EditorWrap;
