import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/firebase/firebase';
import {
  QueryDocumentSnapshot,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useState } from 'react';
import Comments from './Comments';
import {
  IAddCommentArg,
  IChildComment,
  IChildCommentState,
  IComment,
  ICommentsProps,
  IParentComment,
  IRemoveCommentFuncArg,
  IUser,
} from '@/types/common';
import { useUserUid } from '@/contexts/LoginUserState';

const removedProfileImageURL =
  'https://firebasestorage.googleapis.com/v0/b/community-8a2d7.appspot.com/o/userImage%2Fanonymous.png?alt=media&token=5a5ebb3a-4144-43c1-be10-cbc2a9b0831b';

const CommentsContainer = ({ articleId }: ICommentsProps) => {
  const [user, setUser] = useState<IUser | undefined>();
  const [comment, setComment] = useState('');
  const [childCommentState, setChildCommentState] = useState<IChildCommentState>({});

  const queryClient = useQueryClient();

  const onCommentHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const { userUid } = useUserUid();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, 'users', userUid as string);
        const user = (await getDoc(userRef)).data() as IUser;
        setUser(user);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  /** 댓글을 DB로부터 받아와 부모-자식 관계로 만드는 함수 */
  const fetchComments = async () => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('articleId', '==', articleId));
    const allComments = (await getDocs(q)).docs as QueryDocumentSnapshot[];
    // 최신 순으로 출력되도록 정렬(firestore 메소드)
    allComments.sort((a, b) => a?.data().createdAt.toMillis() - b?.data().createdAt.toMillis());
    const parentComments: IParentComment[] = [];
    const childComments: IChildComment[] = [];
    allComments.forEach((data) => {
      const comment = data.data() as IComment;
      const id = data.id;
      // 부모인 경우
      if (!comment.parentId) {
        parentComments.push({ ...comment, commentId: id, children: [] });
      }
      // 자식인 경우
      else {
        childComments.push({ ...comment, commentId: id });
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
  const { data: comments } = useQuery({ queryKey: ['comments'], queryFn: fetchComments });

  const onAddComment = async ({ parentId = null }: IAddCommentArg) => {
    try {
      const newComment: IComment = {
        articleId,
        uid: userUid as string,
        nickName: user?.nickName as string,
        profileImage: user?.profileImage as string,
        comment: parentId ? childCommentState[parentId].text : comment,
        parentId: parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isRemoved: false,
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

  const onRemoveComment = async ({ commentId }: IRemoveCommentFuncArg) => {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const removedComment = {
        uid: '',
        nickName: '',
        profileImage: removedProfileImageURL,
        comment: '삭제된 메세지입니다.',
        isRemoved: true,
      };
      await updateDoc(commentRef, removedComment);
    } catch (error) {
      console.log(error);
    }
  };
  const { mutate: removeComment } = useMutation({
    mutationFn: onRemoveComment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  return (
    <>
      <div className="flex items-center">
        <Textarea value={comment} onChange={onCommentHandler} />
        <Button onClick={() => uploadComment({ parentId: null })}>작성</Button>
      </div>
      <div>
        <Comments
          comments={comments!}
          childCommentState={childCommentState}
          setChildCommentState={setChildCommentState}
          uploadComment={uploadComment}
          removeComment={removeComment}
        />
      </div>
    </>
  );
};

export default CommentsContainer;
