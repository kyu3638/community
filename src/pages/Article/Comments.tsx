import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { IAddCommentArg, IChildCommentState, IComment, IParentComment, IRemoveCommentFuncArg } from '@/types/common';
import ChildComments from './ChildComments';
import { useUserUid } from '@/contexts/LoginUserState';

interface ICommentsProps {
  comments: IParentComment[];
  childCommentState: IChildCommentState;
  setChildCommentState: React.Dispatch<React.SetStateAction<IChildCommentState>>;
  uploadComment: (parentId: IAddCommentArg) => Promise<void>;
  removeComment: (commentId: IRemoveCommentFuncArg) => Promise<void>;
}

const Comments = ({
  comments,
  childCommentState,
  setChildCommentState,
  uploadComment,
  removeComment,
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
            />
            {children &&
              children.map((child: IComment, index: number) => {
                return (
                  <div key={`childComment_${index}`} className="ml-10">
                    <div className="flex items-center py-3 mb-5 ">
                      <AvatarInCard avatarImageSrc={child.profileImage} />
                      <div>{child.nickName}</div>
                    </div>
                    <div className="flex">
                      <div>{child.comment}</div>
                    </div>
                  </div>
                );
              })}
            <hr />
          </div>
        );
      })}
    </>
  );
};

export default Comments;
