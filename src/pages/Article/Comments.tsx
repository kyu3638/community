import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import { DocumentData, addDoc, collection, doc, getDoc, getDocs } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useState } from 'react';

interface ICommentsProps {
  articleId: string;
  userUid: string;
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

const Comments = ({ articleId, userUid }: ICommentsProps) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<DocumentData[] | undefined>();

  const onCommentHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const fetchUser = async (): Promise<IUser | undefined> => {
    try {
      const userDocRef = doc(db, 'users', userUid as string);
      const res = await getDoc(userDocRef);
      const user = res.data() as IUser;
      return user;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser, refetchOnWindowFocus: true });

  const onAddComment = async () => {
    try {
      const newComment: IComment = {
        articleId,
        uid: userUid,
        nickName: user?.nickName as string,
        profileImage: user?.profileImage as string,
        comment: comment,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addDoc(collection(db, 'comments'), newComment);
      setComment('');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      const ref = collection(db, 'comments');
      const allComments = await getDocs(ref);
      console.log(allComments);
      setComments(allComments.docs);
    };
    fetchComments();
  }, []);

  return (
    <>
      <div className="flex items-center">
        <Textarea value={comment} onChange={onCommentHandler} />
        <Button onClick={onAddComment}>작성</Button>
      </div>
      <div>
        {comments?.map((data) => {
          const comment = data.data() as IComment;
          const commentId = data.id;
          return (
            <div key={commentId}>
              <div className="flex items-center">
                <AvatarInCard avatarImageSrc={comment.profileImage} />
                <div>{comment.nickName}</div>
              </div>
              <div>{comment.comment}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Comments;
