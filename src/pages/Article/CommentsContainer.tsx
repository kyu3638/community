import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { useMutation } from '@tanstack/react-query';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';

interface ICommentsProps {
  articleId: string;
}

const CommentsContainer = ({ articleId }: ICommentsProps) => {
  const [createCommentInput, setCreateCommentInput] = useState('');
  const { userUid, userData } = useUserUid();

  const onCreateCommentInputHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCreateCommentInput(e.target.value);
  };

  const onAddParentComment = async () => {
    try {
      const newComment = {
        articleId,
        uid: userUid!,
        nickName: userData?.nickName,
        profileImage: userData?.profileImage,
        comment: createCommentInput,
        like: [],
        createdAt: new Date(),
        isRemoved: false,
      };
      const collectionRef = collection(db, `feeds/${articleId}/parentComment`);
      await addDoc(collectionRef, newComment);
    } catch (error) {
      console.log(error);
    }
  };
  const { mutate: uploadComment } = useMutation({ mutationFn: onAddParentComment });

  return (
    <>
      <div className="flex items-center">
        <Textarea value={createCommentInput} onChange={onCreateCommentInputHandler} />
        <Button onClick={() => uploadComment()}>작성</Button>
      </div>
    </>
  );
};

export default CommentsContainer;
