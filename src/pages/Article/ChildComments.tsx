import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserUid } from '@/contexts/LoginUserState';
import { CommentStateMode, IChildComment, IChildCommentState, IRemoveCommentFuncArg } from '@/types/common';
import React from 'react';
import { FaRegHeart } from 'react-icons/fa';
import { FcLike } from 'react-icons/fc';

interface IChildCommentsHandle {
  commentsState: IChildCommentState;
  removeComment: ({ commentId }: IRemoveCommentFuncArg) => void;
  children: IChildComment[];
  editCommentModeHandler: (commentId: string, mode: CommentStateMode) => void;
  editCommentTextHandler: (commentId: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  updateCommentAndChangeMode: (commentId: string, text: string) => void;
}

const ChildComments = ({
  commentsState,
  removeComment,
  children,
  editCommentModeHandler,
  editCommentTextHandler,
  updateCommentAndChangeMode,
}: IChildCommentsHandle) => {
  const { userUid } = useUserUid();

  return (
    <>
      {children &&
        children.map((child: IChildComment, index: number) => {
          const childId = child.commentId;
          const isLike = child.like.includes(userUid as string);
          return (
            <div key={`childComment_${index}`} className="ml-10">
              <div className="flex items-center py-3 mb-5 ">
                <AvatarInCard avatarImageSrc={child.profileImage} />
                <div>{child.nickName}</div>
              </div>
              <div className="flex justify-between">
                {commentsState[childId]?.editMode === 'view' && (
                  <>
                    <div>{child.comment}</div>
                    <div className="flex items-center">
                      <div className="flex gap-3">
                        {isLike ? <FcLike /> : <FaRegHeart />}
                        <span>{child.like.length}</span>
                      </div>
                      {userUid === child.uid && (
                        <>
                          <Button onClick={() => editCommentModeHandler(childId, 'edit')}>수정</Button>
                          <Button onClick={() => removeComment({ commentId: childId })}>삭제</Button>
                        </>
                      )}
                    </div>
                  </>
                )}
                {commentsState[childId]?.editMode === 'edit' && (
                  <div className="flex justify-between">
                    <Textarea
                      value={commentsState[childId]?.text}
                      onChange={(e) => editCommentTextHandler(childId, e)}
                    />
                    {userUid === child.uid && (
                      <>
                        <Button onClick={() => updateCommentAndChangeMode(childId, commentsState[childId].text)}>
                          저장
                        </Button>
                        <Button onClick={() => editCommentModeHandler(childId, 'view')}>취소</Button>
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
