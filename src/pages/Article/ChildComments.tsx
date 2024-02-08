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
  childCommentState: IChildCommentState;
  setChildCommentState: React.Dispatch<React.SetStateAction<IChildCommentState>>;
  uploadComment: ({ parentId }: IAddCommentArg) => void;
  removeComment: ({ commentId }: IRemoveCommentFuncArg) => void;
  children: IChildComment[];
  updateComment: ({ targetCommentId, targetCommentText }: IUpdateCommentFuncArg) => void;
}

const ChildComments = ({
  commentId,
  childCommentState,
  setChildCommentState,
  uploadComment,
  removeComment,
  children,
  updateComment,
}: IChildCommentsHandle) => {
  const { userUid } = useUserUid();

  /** 자식 댓글 편집기 열고 닫기 */
  const editChildCommentModeHandler = (commentId: string, mode: CommentStateMode) => {
    setChildCommentState((prev) => {
      return {
        ...prev,
        [commentId]: {
          editMode: mode,
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

  const updateChildCommentAndChangeMode = (commentId: string, text: string) => {
    // commentId에 해당하는 댓글을 업데이트하는 함수 필요
    updateComment({ targetCommentId: commentId, targetCommentText: text });
    setChildCommentState((prev) => {
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
      {childCommentState[commentId]?.editMode === 'view' && (
        <Button onClick={() => editChildCommentModeHandler(commentId, 'create')}>댓글 남기기</Button>
      )}
      {childCommentState[commentId]?.editMode === 'create' && (
        <div>
          <Textarea value={childCommentState[commentId].text} onChange={(e) => editChildCommentTextHandler(e)} />
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
                {childCommentState[childId]?.editMode === 'edit' && (
                  <Textarea
                    value={childCommentState[childId]?.text}
                    onChange={(e) => {
                      setChildCommentState((prev) => {
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
                {childCommentState[childId]?.editMode === 'view' && <div>{child.comment}</div>}
                {userUid === child.uid && (
                  <div>
                    {childCommentState[childId]?.editMode === 'edit' && (
                      <>
                        <Button
                          onClick={() => updateChildCommentAndChangeMode(childId, childCommentState[childId].text)}
                        >
                          저장
                        </Button>
                        <Button onClick={() => editChildCommentModeHandler(childId, 'view')}>취소</Button>
                      </>
                    )}
                    {childCommentState[childId]?.editMode === 'view' && (
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
