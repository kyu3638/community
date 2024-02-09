import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import {
  CommentStateMode,
  IAddCommentArg,
  IChildCommentState,
  IParentComment,
  IRemoveCommentFuncArg,
  IUpdateCommentFuncArg,
} from '@/types/common';
import ChildComments from './ChildComments';
import { useUserUid } from '@/contexts/LoginUserState';
import { Textarea } from '@/components/ui/textarea';
import { FcLike } from 'react-icons/fc';
import { FaRegHeart } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { arrayRemove, arrayUnion, doc, updateDoc } from '@firebase/firestore';
import { db } from '@/firebase/firebase';

interface ICommentsProps {
  comments: IParentComment[];
  commentsState: IChildCommentState;
  setCommentsState: React.Dispatch<React.SetStateAction<IChildCommentState>>;
  uploadComment: ({ parentId }: IAddCommentArg) => void;
  removeComment: ({ commentId }: IRemoveCommentFuncArg) => void;
  updateComment: ({ targetCommentId, targetCommentText }: IUpdateCommentFuncArg) => void;
}

const Comments = ({
  comments,
  commentsState,
  setCommentsState,
  uploadComment,
  removeComment,
  updateComment,
}: ICommentsProps) => {
  const { userUid } = useUserUid();

  const queryClient = useQueryClient();

  const editCommentModeHandler = (commentId: string, mode: CommentStateMode) => {
    setCommentsState((prev) => {
      return {
        ...prev,
        [commentId]: {
          ...commentsState[commentId],
          editMode: mode,
        },
      };
    });
  };

  const editCommentTextHandler = (commentId: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentsState((prev) => {
      return {
        ...prev,
        [commentId]: {
          ...commentsState[commentId],
          text: e.target.value,
        },
      };
    });
  };

  const updateCommentAndChangeMode = (commentId: string, text: string) => {
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

  const onLikeComment = async ({ commentId: commentId, type: type }: { commentId: string; type: string }) => {
    try {
      console.log(`commentId : ${commentId}, type : ${type}`);
      const command = type === 'addLike' ? arrayUnion : arrayRemove;

      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, { like: command(userUid) });
    } catch (error) {
      console.log(error);
    }
  };
  const { mutate: likeComment } = useMutation({
    mutationFn: onLikeComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  return (
    <>
      {comments?.map((data: IParentComment) => {
        const comment = data;
        const commentId = comment.commentId;
        const children = comment.children;
        console.log(comment.like);
        const isLike = comment.like.includes(userUid as string);
        return (
          <div key={commentId}>
            <div className="flex items-center py-3 mb-5">
              <AvatarInCard avatarImageSrc={comment.profileImage} />
              <div>{comment.nickName}</div>
            </div>
            <div className="flex justify-between">
              {commentsState[commentId]?.editMode === 'view' && (
                <>
                  <div>{comment.comment}</div>
                  <div className="flex items-center">
                    <div className="flex gap-3">
                      {isLike ? (
                        <FcLike onClick={() => likeComment({ commentId: commentId, type: 'removeLike' })} />
                      ) : (
                        <FaRegHeart onClick={() => likeComment({ commentId: commentId, type: 'addLike' })} />
                      )}
                      <span>{comment.like.length}</span>
                    </div>
                    {userUid === comment.uid && (
                      <>
                        <Button onClick={() => editCommentModeHandler(commentId, 'edit')}>수정</Button>
                        <Button onClick={() => removeComment({ commentId })}>삭제</Button>
                      </>
                    )}
                  </div>
                </>
              )}
              {commentsState[commentId]?.editMode === 'edit' && (
                <div className="flex justify-between">
                  <Textarea
                    value={commentsState[commentId]?.text}
                    onChange={(e) => editCommentTextHandler(commentId, e)}
                  />
                  {userUid === comment.uid && (
                    <>
                      <Button onClick={() => updateCommentAndChangeMode(commentId, commentsState[commentId].text)}>
                        저장
                      </Button>
                      <Button onClick={() => editCommentModeHandler(commentId, 'view')}>취소</Button>
                    </>
                  )}
                </div>
              )}
            </div>
            {commentsState[commentId]?.editMode === 'view' && (
              <Button onClick={() => editCommentModeHandler(commentId, 'create')}>대댓글 남기기</Button>
            )}
            {commentsState[commentId]?.editMode === 'create' && (
              <div className="flex justify-between">
                <Textarea
                  value={commentsState[commentId].text}
                  onChange={(e) => editCommentTextHandler(commentId, e)}
                />
                <Button onClick={() => uploadComment({ parentId: commentId })}>저장</Button>
                <Button onClick={() => editCommentModeHandler(commentId, 'view')}>취소</Button>
              </div>
            )}
            <ChildComments
              commentsState={commentsState}
              removeComment={removeComment}
              children={children}
              editCommentModeHandler={editCommentModeHandler}
              editCommentTextHandler={editCommentTextHandler}
              updateCommentAndChangeMode={updateCommentAndChangeMode}
            />
            <hr />
          </div>
        );
      })}
    </>
  );
};

export default Comments;
