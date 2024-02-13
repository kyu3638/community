import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  QueryDocumentSnapshot,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaRegHeart } from 'react-icons/fa';
import { FcLike } from 'react-icons/fc';

interface ICommentsProps {
  articleId: string;
}

interface ICommentFromDB extends QueryDocumentSnapshot {
  articleId: string;
  uid: string;
  nickName: string;
  profileImage: string;
  comment: string;
  like: string[];
  createdAt: Date;
  isRemoved: boolean;
}

interface IChildComment extends ICommentFromDB {
  mode: string;
}
interface IParentComment extends ICommentFromDB {
  children: IChildComment[];
  mode: string;
}

interface IParentsState {
  [id: string]: IParentComment;
}

const CommentsContainer = ({ articleId }: ICommentsProps) => {
  const [createParentCommentInput, setCreateParentCommentInput] = useState<string>('');
  const [parentsState, setParentsState] = useState<IParentsState>({});

  const queryClient = useQueryClient();
  const { userUid, userData } = useUserUid();

  const onChangeCreateParentCommentInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCreateParentCommentInput(e.target.value);
  };

  const fetchParentComments = async () => {
    const parentCommentsRef = collection(db, `feeds/${articleId}/parentComments`);
    const q = query(parentCommentsRef, orderBy('createdAt', 'asc'));
    const response = (await getDocs(q)).docs as ICommentFromDB[];
    return response;
  };
  const { data: parents } = useQuery({
    queryKey: ['parentComments'],
    queryFn: fetchParentComments,
  });
  /** 부모 댓글 불러오면 children, mode 추가하여 객체형태로 state생성 */
  useEffect(() => {
    if (parents) {
      let parentsObj = {};
      parents.forEach((parent) => {
        const parentId = parent.id;
        parentsObj = {
          ...parentsObj,
          [parentId]: {
            ...parent.data(),
            children: [],
            mode: 'view',
          },
        };
      });
      setParentsState(parentsObj);
    }
  }, [parents]);

  const fetchChildComments = async (parentId: string) => {
    const childCommentsRef = collection(db, `feeds/${articleId}/parentComments/${parentId}/childComments`);
    const q = query(childCommentsRef);
    const response = (await getDocs(q)).docs;
    return response;
  };
  const { data: children } = useQueries({
    queries: Object.keys(parentsState).map((parentId) => ({
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parentComments'] });
    },
  });

  const onLikeParentComment = async ({ commentId, type }: { commentId: string; type: string }) => {
    const command = type === 'addLike' ? arrayUnion : arrayRemove;

    const commentRef = doc(db, `feeds/${articleId}/parentComments`, commentId);
    await updateDoc(commentRef, { like: command(userUid) });
  };
  const { mutate: likeParentComment } = useMutation({
    mutationFn: onLikeParentComment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parentComments'] });
    },
  });

  const onRemoveParentComment = async ({ commentId }: { commentId: string }) => {
    const commentRef = doc(db, `feeds/${articleId}/parentComments`, commentId);
    await deleteDoc(commentRef);
  };
  const { mutate: removeParentComment } = useMutation({
    mutationFn: onRemoveParentComment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parentComments'] });
    },
  });

  /** 댓글 수정 모드 */
  const onChangeParentCommentMode = (commentId: string, type: string) => {
    setParentsState((prevState) => {
      return { ...prevState, [commentId]: { ...prevState[commentId], mode: type } as IParentComment };
    });
  };
  /** 댓글 수정 textArea 텍스트 입력 */
  const onChangeParentCommentEditText = (commentId: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParentsState((prevState) => {
      return { ...prevState, [commentId]: { ...prevState[commentId], comment: e.target.value } as IParentComment };
    });
  };
  /** 수정된 텍스트 업데이트 */
  const onEditParentComment = async ({ commentId }: { commentId: string }) => {
    console.log(parentsState[commentId].comment);
    const commentRef = doc(db, `feeds/${articleId}/parentComments`, commentId);
    await updateDoc(commentRef, { comment: parentsState[commentId].comment });
  };
  const { mutate: editParentComment } = useMutation({
    mutationFn: onEditParentComment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parentComments'] });
    },
  });

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center">
          <Textarea value={createParentCommentInput} onChange={onChangeCreateParentCommentInput} />
          <Button onClick={() => uploadParentComment()}>작성</Button>
        </div>
        <div className="flex flex-col">
          {Object.entries(parentsState).map(([id, parentComment]) => {
            const parentId = id;
            const parent = parentComment as IParentComment;
            const isLike = parent.like.includes(userUid);
            const isCommentWriter = parent.uid === userUid;
            const isView = parent.mode === 'view';
            const isEdit = parent.mode === 'edit';
            return (
              <div key={parentId} className="border">
                <div className="flex items-center gap-5">
                  <AvatarInCard avatarImageSrc={parent.profileImage} />
                  {parent.nickName}
                </div>
                <div className="flex justify-between">
                  {isView && (
                    <>
                      <span>{parent.comment}</span>
                      <div className="flex gap-3">
                        {isLike ? (
                          <FcLike onClick={() => likeParentComment({ commentId: parentId, type: 'removeLike' })} />
                        ) : (
                          <FaRegHeart onClick={() => likeParentComment({ commentId: parentId, type: 'addLike' })} />
                        )}
                        {isCommentWriter && (
                          <>
                            <span onClick={() => onChangeParentCommentMode(parentId, 'edit')}>수정</span>
                            <span onClick={() => removeParentComment({ commentId: parentId })}>삭제</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                  {isEdit && (
                    <>
                      <Textarea
                        value={parentsState[parentId].comment}
                        onChange={(e) => onChangeParentCommentEditText(parentId, e)}
                      />
                      <div className="flex">
                        <span onClick={() => editParentComment({ commentId: parentId })}>저장</span>
                        <span onClick={() => onChangeParentCommentMode(parentId, 'view')}>취소</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CommentsContainer;
