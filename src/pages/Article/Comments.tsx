import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import { doc, getDoc } from '@firebase/firestore';
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
  comment: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
}

const Comments = ({ articleId, userUid }: ICommentsProps) => {
  console.log(articleId);
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

  const onUploadComment = () => {
    
  }

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
