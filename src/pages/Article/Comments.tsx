import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/firebase/firebase';
import { QueryDocumentSnapshot, addDoc, collection, getDocs, orderBy, query } from '@firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';

interface ICommentsProps {
  articleId: string;
  userUid: string;
  nickName: string | undefined;
  profileImage: string | undefined;
}

interface IComment {
  articleId: string;
  uid: string;
  nickName: string;
  profileImage: string;
  comment: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IParentComment extends IComment {
  commentId: string;
  children: IComment[];
}

interface IChildCommentState {
  [id: string]: { editMode: boolean; text: string };
}

interface IAddCommentArg {
  parentId: string | null;
}

const Comments = ({ articleId, userUid, nickName, profileImage }: ICommentsProps) => {
  const [comment, setComment] = useState('');
  const [childCommentState, setChildCommentState] = useState<IChildCommentState>({});

  const queryClient = useQueryClient();

  const onCommentHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const fetchComments = async () => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const allComments = (await getDocs(q)).docs as QueryDocumentSnapshot[];
    const parentComments: IParentComment[] = [];
    const childComments: IComment[] = [];
    allComments.forEach((data) => {
      const comment = data.data() as IComment;
      const id = data.id;
      // 부모인 경우
      if (!comment.parentId) {
        parentComments.push({ ...comment, commentId: id, children: [] });
      }
      // 자식인 경우
      else {
        childComments.push(comment);
      }
      setChildCommentState((prev) => {
        return { ...prev, [id]: { editMode: false, text: '' } };
      });
    });
    childComments.forEach((child) => {
      parentComments.forEach((parent) => {
        if (parent.commentId === child.parentId) {
          parent.children.push(child);
        }
      });
    });
    return parentComments;
  };
  const { data: comments, isLoading: commentsLoading } = useQuery({ queryKey: ['comments'], queryFn: fetchComments });

  const onAddComment = async ({ parentId = null }: IAddCommentArg) => {
    try {
      const newComment: IComment = {
        articleId,
        uid: userUid,
        nickName: nickName as string,
        profileImage: profileImage as string,
        comment: parentId ? childCommentState[parentId].text : comment,
        parentId: parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addDoc(collection(db, 'comments'), newComment);
      if (parentId) {
        setChildCommentState((prev) => {
          return { ...prev, [parentId]: { editMode: true, text: '' } };
        });
      } else {
        setComment('');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const { mutate: uploadComment } = useMutation({
    mutationFn: onAddComment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  if (commentsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center">
        <Textarea value={comment} onChange={onCommentHandler} />
        <Button onClick={() => uploadComment({ parentId: null })}>작성</Button>
      </div>
      <div>
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
              <div className="flex">
                <div>{comment.comment}</div>
                <Button>수정</Button>
              </div>
              {!childCommentState[commentId]?.editMode && (
                <Button
                  onClick={() =>
                    setChildCommentState((prev) => {
                      return {
                        ...prev,
                        [commentId]: {
                          editMode: !childCommentState[commentId].editMode,
                          text: childCommentState[commentId].text,
                        },
                      };
                    })
                  }
                >
                  댓글 남기기
                </Button>
              )}
              {childCommentState[commentId]?.editMode && (
                <div>
                  <Textarea
                    value={childCommentState[commentId].text}
                    onChange={(e) => {
                      setChildCommentState((prev) => {
                        return {
                          ...prev,
                          [commentId]: {
                            editMode: childCommentState[commentId].editMode,
                            text: e.target.value,
                          },
                        };
                      });
                    }}
                  />
                  <Button onClick={() => uploadComment({ parentId: commentId })}>저장</Button>
                  <Button
                    onClick={() =>
                      setChildCommentState((prev) => {
                        return {
                          ...prev,
                          [commentId]: {
                            editMode: !childCommentState[commentId].editMode,
                            text: childCommentState[commentId].text,
                          },
                        };
                      })
                    }
                  >
                    취소
                  </Button>
                </div>
              )}
              {children.length > 0 &&
                children.map((child: IComment, index) => {
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
      </div>
    </>
  );
};

export default Comments;
