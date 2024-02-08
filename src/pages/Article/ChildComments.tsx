import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IAddCommentArg, IChildComment, IChildCommentState, IRemoveCommentFuncArg } from '@/types/common';
import React from 'react';

interface IChildCommentsHandle {
  commentId: string;
  childCommentState: IChildCommentState;
  setChildCommentState: React.Dispatch<React.SetStateAction<IChildCommentState>>;
  uploadComment: (parentId: IAddCommentArg) => void;
  removeComment: (commentId: IRemoveCommentFuncArg) => void;
  children: IChildComment[];
}

const ChildComments = ({
  commentId,
  childCommentState,
  setChildCommentState,
  uploadComment,
  removeComment,
  children,
}: IChildCommentsHandle) => {
  /** 자식 댓글 편집기 열고 닫기 */
  const editChildCommentModeHandler = (commentId: string) => {
    setChildCommentState((prev) => {
      return {
        ...prev,
        [commentId]: {
          editMode: !childCommentState[commentId].editMode,
          text: childCommentState[commentId].text,
        },
      };
    });
  };

  /** 자식 댓글 편집기에 작성 */
  const editChildCommentTextHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChildCommentState((prev) => {
      return {
        ...prev,
        [commentId]: {
          editMode: childCommentState[commentId].editMode,
          text: e.target.value,
        },
      };
    });
  };

  return (
    <>
      {!childCommentState[commentId]?.editMode && (
        <Button onClick={() => editChildCommentModeHandler(commentId)}>댓글 남기기</Button>
      )}
      {childCommentState[commentId]?.editMode && (
        <div>
          <Textarea value={childCommentState[commentId].text} onChange={(e) => editChildCommentTextHandler(e)} />
          <Button onClick={() => uploadComment({ parentId: commentId })}>저장</Button>
          <Button onClick={() => editChildCommentModeHandler(commentId)}>취소</Button>
        </div>
      )}
      {children &&
        children.map((child: IChildComment, index: number) => {
          return (
            <div key={`childComment_${index}`} className="ml-10">
              <div className="flex items-center py-3 mb-5 ">
                <AvatarInCard avatarImageSrc={child.profileImage} />
                <div>{child.nickName}</div>
              </div>
              <div className="flex justify-between">
                <div>{child.comment}</div>
                <div>
                  <Button onClick={() => removeComment({ commentId: child.commentId })}>삭제</Button>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
};

export default ChildComments;
