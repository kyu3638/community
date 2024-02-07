import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import { addDoc, collection, doc, getDoc } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';

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

  const onUploadComment = async () => {
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <Textarea value={comment} onChange={onCommentHandler} />
        <Button onClick={onUploadComment}>작성</Button>
      </div>
    </>
  );
};

export default Comments;
