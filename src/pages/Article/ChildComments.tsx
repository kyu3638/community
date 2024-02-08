import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserUid } from '@/contexts/LoginUserState';
import {
  CommentStateMode,
  IAddCommentArg,
  IChildComment,
  IChildCommentState,
  IRemoveCommentFuncArg,
  IUpdateCommentFuncArg,
} from '@/types/common';
import React from 'react';

interface IChildCommentsHandle {
  commentId: string;
  commentsState: IChildCommentState;
  setCommentsState: React.Dispatch<React.SetStateAction<IChildCommentState>>;
  uploadComment: ({ parentId }: IAddCommentArg) => void;
  removeComment: ({ commentId }: IRemoveCommentFuncArg) => void;
  children: IChildComment[];
  updateComment: ({ targetCommentId, targetCommentText }: IUpdateCommentFuncArg) => void;
}

const ChildComments = ({
  commentId,
  commentsState,
  setCommentsState,
  uploadComment,
  removeComment,
  children,
  updateComment,
}: IChildCommentsHandle) => {
  const { userUid } = useUserUid();

  const editChildCommentModeHandler = (commentId: string, mode: CommentStateMode) => {
    setCommentsState((prev) => {
      return {
        ...prev,
        [commentId]: {
          editMode: mode,
          text: commentsState[commentId].text,
        },
      };
    });
  };

  const editChildCommentTextHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentsState((prev) => {
      return {
        ...prev,
        [commentId]: {
          editMode: commentsState[commentId].editMode,
          text: e.target.value,
        },
      };
    });
  };

  const updateChildCommentAndChangeMode = (commentId: string, text: string) => {
    updateComment({ targetCommentId: commentId, targetCommentText: text });
    setCommentsState((prev) => {
      return {
        ...prev,
        [commentId]: {
          editMode: 'view',
          text: '',
        },
      };
    });
  };

  return (
    <>
      {/* 자식 댓글 작성 */}
      {commentsState[commentId]?.editMode === 'view' && (
        <Button onClick={() => editChildCommentModeHandler(commentId, 'create')}>댓글 남기기</Button>
      )}
      {commentsState[commentId]?.editMode === 'create' && (
        <div>
          <Textarea value={commentsState[commentId].text} onChange={(e) => editChildCommentTextHandler(e)} />
          <Button onClick={() => uploadComment({ parentId: commentId })}>저장</Button>
          <Button onClick={() => editChildCommentModeHandler(commentId, 'view')}>취소</Button>
        </div>
      )}
      {children &&
        children.map((child: IChildComment, index: number) => {
          const childId = child.commentId;
          return (
            <div key={`childComment_${index}`} className="ml-10">
              <div className="flex items-center py-3 mb-5 ">
                <AvatarInCard avatarImageSrc={child.profileImage} />
                <div>{child.nickName}</div>
              </div>
              <div className="flex justify-between">
                {commentsState[childId]?.editMode === 'edit' && (
                  <Textarea
                    value={commentsState[childId]?.text}
                    onChange={(e) => {
                      setCommentsState((prev) => {
                        return {
                          ...prev,
                          [childId]: {
                            editMode: 'edit',
                            text: e.target.value,
                          },
                        };
                      });
                    }}
                  />
                )}
                {commentsState[childId]?.editMode === 'view' && <div>{child.comment}</div>}
                {userUid === child.uid && (
                  <div>
                    {commentsState[childId]?.editMode === 'edit' && (
                      <>
                        <Button onClick={() => updateChildCommentAndChangeMode(childId, commentsState[childId].text)}>
                          저장
                        </Button>
                        <Button onClick={() => editChildCommentModeHandler(childId, 'view')}>취소</Button>
                      </>
                    )}
                    {commentsState[childId]?.editMode === 'view' && (
                      <>
                        <Button onClick={() => editChildCommentModeHandler(childId, 'edit')}>수정</Button>
                        <Button onClick={() => removeComment({ commentId: childId })}>삭제</Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </>
  );
};

export default ChildComments;
