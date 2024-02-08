import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import {
  IAddCommentArg,
  IChildCommentState,
  IParentComment,
  IRemoveCommentFuncArg,
  IUpdateCommentFuncArg,
} from '@/types/common';
import ChildComments from './ChildComments';
import { useUserUid } from '@/contexts/LoginUserState';

interface ICommentsProps {
  comments: IParentComment[];
  childCommentState: IChildCommentState;
  setChildCommentState: React.Dispatch<React.SetStateAction<IChildCommentState>>;
  uploadComment: ({ parentId }: IAddCommentArg) => void;
  removeComment: ({ commentId }: IRemoveCommentFuncArg) => void;
  updateComment: ({ targetCommentId, targetCommentText }: IUpdateCommentFuncArg) => void;
}

const Comments = ({
  comments,
  childCommentState,
  setChildCommentState,
  uploadComment,
  removeComment,
  updateComment,
}: ICommentsProps) => {
  const { userUid } = useUserUid();

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
              <div>{comment.comment}</div>
              <div>
                {userUid === comment.uid && (
                  <>
                    <Button>수정</Button>
                    <Button onClick={() => removeComment({ commentId })}>삭제</Button>
                  </>
                )}
              </div>
            </div>
            <ChildComments
              commentId={commentId}
              childCommentState={childCommentState}
              setChildCommentState={setChildCommentState}
              uploadComment={uploadComment}
              removeComment={removeComment}
              children={children}
              updateComment={updateComment}
            />
            <hr />
          </div>
        );
      })}
    </>
  );
};

export default Comments;
