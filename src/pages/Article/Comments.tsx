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

  return (
    <>
      {comments?.map((data: IParentComment) => {
        const comment = data;
        const commentId = comment.commentId;
        const children = comment.children;
        return (
          <div key={commentId}>
            <div className="flex items-center py-3 mb-5">
              <AvatarInCard avatarImageSrc={comment.profileImage} />
              <div>{comment.nickName}</div>
            </div>
            <div className="flex justify-between">
              {commentsState[commentId]?.editMode === 'view' && <div>{comment.comment}</div>}
              {commentsState[commentId]?.editMode === 'edit' && (
                <Textarea
                  value={commentsState[commentId]?.text}
                  onChange={(e) => editCommentTextHandler(commentId, e)}
                />
              )}
              <div>
                {userUid === comment.uid && commentsState[commentId]?.editMode === 'view' && (
                  <>
                    <Button onClick={() => editCommentModeHandler(commentId, 'edit')}>수정</Button>
                    <Button onClick={() => removeComment({ commentId })}>삭제</Button>
                  </>
                )}
                {userUid === comment.uid && commentsState[commentId]?.editMode === 'edit' && (
                  <>
                    <Button onClick={() => updateCommentAndChangeMode(commentId, commentsState[commentId].text)}>
                      저장
                    </Button>
                    <Button onClick={() => editCommentModeHandler(commentId, 'view')}>취소</Button>
                  </>
                )}
              </div>
            </div>
            {commentsState[commentId]?.editMode === 'view' && (
              <Button onClick={() => editCommentModeHandler(commentId, 'create')}>댓글 남기기</Button>
            )}
            {commentsState[commentId]?.editMode === 'create' && (
              <div>
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
