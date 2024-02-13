import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

interface ICommentsProps {
  articleId: string;
}

const CommentsContainer = ({ articleId }: ICommentsProps) => {
  const [createParentCommentInput, setCreateParentCommentInput] = useState<string>('');
  const [parentIds, setParentIds] = useState<string[]>([]);

  const { userData } = useUserUid();

  const onChangeCreateParentCommentInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCreateParentCommentInput(e.target.value);
  };

  const fetchParentComments = async () => {
    const parentCommentsRef = collection(db, `feeds/${articleId}/parentComments`);
    const q = query(parentCommentsRef, orderBy('createdAt', 'asc'));
    const response = (await getDocs(q)).docs;
    return response;
  };
  const { data: parents } = useQuery({
    queryKey: ['parentComments'],
    queryFn: fetchParentComments,
  });
  useEffect(() => {
    if (parents) {
      setParentIds(parents.map((comment) => comment.id));
    }
  }, [parents]);

  const fetchChildComments = async (parentId: string) => {
    const childCommentsRef = collection(db, `feeds/${articleId}/parentComments/${parentId}/childComments`);
    const q = query(childCommentsRef);
    const response = (await getDocs(q)).docs;
    return response;
  };
  const { data: children } = useQueries({
    queries: parentIds.map((parentId) => ({
      queryKey: ['post', parentId],
      queryFn: () => fetchChildComments(parentId),
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      };
    },
  });
  console.log(children);

  /** 부모 댓글 생성 함수 */
  const onCreateParentComment = async () => {
    const newParentComment = {
      articleId,
      uid: userData?.uid,
      nickName: userData?.nickName,
      profileImage: userData?.profileImage,
      comment: createParentCommentInput,
      like: [],
      createdAt: new Date(),
      inRemoved: false,
    };
    const ref = collection(db, `feeds/${articleId}/parentComments`);
    await addDoc(ref, newParentComment);
  };
  const { mutate: uploadParentComment } = useMutation({
    mutationFn: onCreateParentComment,
  });

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center">
          <Textarea value={createParentCommentInput} onChange={onChangeCreateParentCommentInput} />
          <Button onClick={() => uploadParentComment()}>작성</Button>
        </div>
        <div className="flex flex-col">
          {parents?.map((parent) => {
            const parentComment = parent.data();
            return (
              <div key={parent.id} className="border">
                {parentComment.comment}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CommentsContainer;
