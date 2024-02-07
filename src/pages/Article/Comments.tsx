import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/firebase/firebase';
import { QueryDocumentSnapshot, addDoc, collection, getDocs, orderBy, query } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { BlobOptions } from 'buffer';
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
  children: string[];
}

interface IChildCommentState {
  [id: string]: { editMode: boolean; text: string };
}

const Comments = ({ articleId, userUid, nickName, profileImage }: ICommentsProps) => {
  const [comment, setComment] = useState('');
  const [childCommentState, setChildCommentState] = useState<IChildCommentState>({});

  const onCommentHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const fetchComments = async () => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const allComments = (await getDocs(q)).docs as QueryDocumentSnapshot[];
    const parentComments: IParentComment[] = [];
    const childComments = [];
    allComments.forEach((data) => {
      const comment = data.data() as IComment;
      const id = data.id;
      if (comment.parentId) {
        parentComments.push({ ...comment, commentId: id, children: [] });
      }
      setChildCommentState((prev) => {
        return { ...prev, [id]: { editMode: false, text: '' } };
      });
    });
    return allComments;
  };
  const { data: comments } = useQuery({ queryKey: ['comments'], queryFn: fetchComments });
  console.log(comments);
  const onAddComment = async (parentId: string | null = null) => {
    try {
      console.log(`parentId`, parentId);
      if (parentId) {
        console.log(`childCommentState[parentId].text`, childCommentState[parentId].text);
        console.log(`comment`, comment);
      }
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

  return (
    <>
      <div className="flex items-center">
        <Textarea value={comment} onChange={onCommentHandler} />
        <Button onClick={() => onAddComment()}>작성</Button>
      </div>
      <div>
        {comments?.map((data) => {
          const comment = data.data() as IComment;
          const commentId = data.id;
          console.log(childCommentState);
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
              {!childCommentState[commentId].editMode && (
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
              {childCommentState[commentId].editMode && (
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
                  <Button onClick={() => onAddComment(commentId)}>저장</Button>
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
              <hr />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Comments;
