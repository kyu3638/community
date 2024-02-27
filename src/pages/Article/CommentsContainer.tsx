import AvatarInComment from '@/components/Avatar/AvatarInComment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaRegHeart } from '@react-icons/all-files/fa/FaRegHeart';
import { FcLike } from '@react-icons/all-files/fc/FcLike';
import unknownImage from '/unknown.png';
import { BsArrowReturnRight } from '@react-icons/all-files/bs/BsArrowReturnRight';

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
  createdAt: Date | Timestamp;
  isRemoved: boolean;
}

interface IChildComment extends ICommentFromDB {
  mode: string;
}
interface IParentComment extends ICommentFromDB {
  children: IChildrenState;
  mode: string;
  newChildCreateMode: boolean;
  newChildText: string;
}

interface IParentsState {
  [id: string]: IParentComment;
}

interface IChildrenState {
  [id: string]: IChildComment;
}

const CommentsContainer = ({ articleId }: ICommentsProps) => {
  const [createParentCommentInput, setCreateParentCommentInput] = useState<string>('');
  const [parentsState, setParentsState] = useState<IParentsState>({});

  const queryClient = useQueryClient();
  const { userUid, userData } = useUserUid();

  /** 부모 댓글 작성 textarea 추적 */
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
            children: {},
            mode: 'view',
            newChildCreateMode: false,
            newChildText: '',
          },
        };
      });
      setParentsState(parentsObj);
    }
  }, [parents]);

  const fetchChildComments = async (parentId: string) => {
    const childCommentsRef = collection(db, `feeds/${articleId}/parentComments/${parentId}/childComments`);
    const q = query(childCommentsRef, orderBy('createdAt', 'asc'));
    const response = (await getDocs(q)).docs;
    return { parentId, response };
  };
  const combined = useQueries({
    queries: Object.keys(parentsState).map((parentId) => ({
      queryKey: ['childComments', parentId],
      queryFn: () => fetchChildComments(parentId),
      enabled: !!parentsState,
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      };
    },
  });
  useEffect(() => {
    if (combined.data) {
      const childrenData = combined.data;
      childrenData?.forEach((data) => {
        const parentId = data?.parentId as string;
        const children = data?.response;
        children?.forEach((child) => {
          setParentsState((prevState) => {
            return {
              ...prevState,
              [parentId]: {
                ...prevState[parentId],
                children: {
                  ...prevState[parentId]?.children,
                  [child.id]: { ...child.data(), mode: 'view' },
                } as IChildrenState,
              } as IParentComment,
            };
          });
        });
      });
    }
  }, [combined, parents]);

  /** 부모 댓글 생성 함수 */
  const onCreateParentComment = async () => {
    const newParentComment = {
      articleId,
      uid: userData?.uid,
      nickName: userData?.nickName,
      profileImage: userData?.profileImage.comment,
      comment: createParentCommentInput,
      like: [],
      createdAt: serverTimestamp(),
      isRemoved: false,
    };
    const ref = collection(db, `feeds/${articleId}/parentComments`);
    await addDoc(ref, newParentComment);
  };
  const { mutate: uploadParentComment } = useMutation({
    mutationFn: onCreateParentComment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parentComments'] });
      setCreateParentCommentInput('');
    },
  });

  const onLikeComment = async ({
    parentId,
    childId,
    type,
  }: {
    parentId: string;
    childId?: string | null;
    type: string;
  }) => {
    const command = type === 'addLike' ? arrayUnion : arrayRemove;
    let commentRef;
    if (!childId) {
      commentRef = doc(db, `feeds/${articleId}/parentComments`, parentId);
    } else {
      commentRef = doc(db, `feeds/${articleId}/parentComments/${parentId}/childComments`, childId);
    }
    await updateDoc(commentRef, { like: command(userUid) });
    return { parentId, childId };
  };
  const { mutate: likeComment } = useMutation({
    mutationFn: onLikeComment,
    onSettled: (data) => {
      const parentId = data?.parentId;
      const childId = data?.childId;
      if (!childId) {
        queryClient.invalidateQueries({ queryKey: ['parentComments'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['childComments', parentId] });
      }
    },
  });

  const onRemoveComment = async ({ parentId, childId = null }: { parentId: string; childId?: string | null }) => {
    let commentRef;
    if (!childId) {
      commentRef = doc(db, `feeds/${articleId}/parentComments`, parentId);
    } else {
      commentRef = doc(db, `feeds/${articleId}/parentComments/${parentId}/childComments`, childId);
    }
    await updateDoc(commentRef, {
      uid: '',
      comment: '삭제된 댓글입니다.',
      isRemoved: true,
      nickName: 'unknown',
      profileImage: unknownImage,
    });
    return { parentId, childId };
  };
  const { mutate: removeComment } = useMutation({
    mutationFn: onRemoveComment,
    onSettled: (data) => {
      const parentId = data?.parentId;
      const childId = data?.childId;
      if (!childId) {
        queryClient.invalidateQueries({ queryKey: ['parentComments'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['childComments', parentId] });
      }
    },
  });

  /** 부모 댓글 수정 모드 변경 */
  const onChangeParentCommentMode = (commentId: string, type: string) => {
    setParentsState((prevState) => {
      return { ...prevState, [commentId]: { ...prevState[commentId], mode: type } as IParentComment };
    });
  };
  /** 자식 댓글 수정 모드 변경 */
  const onChangeChildCommentMode = (parentId: string, commentId: string, type: string) => {
    setParentsState((prevState) => {
      return {
        ...prevState,
        [parentId]: {
          ...prevState[parentId],
          children: {
            ...prevState[parentId].children,
            [commentId]: { ...prevState[parentId].children[commentId], mode: type },
          },
        } as IParentComment,
      };
    });
  };
  /** 부모 댓글 수정 textArea 텍스트 입력 */
  const onChangeParentCommentEditText = (commentId: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParentsState((prevState) => {
      return { ...prevState, [commentId]: { ...prevState[commentId], comment: e.target.value } as IParentComment };
    });
  };
  /** 자식 댓글 수정 textArea 텍스트 입력 */
  const onChangeChildCommentEditText = (
    parentId: string,
    commentId: string,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setParentsState((prevState) => {
      return {
        ...prevState,
        [parentId]: {
          ...prevState[parentId],
          children: {
            ...prevState[parentId].children,
            [commentId]: { ...prevState[parentId].children[commentId], comment: e.target.value },
          },
        } as IParentComment,
      };
    });
  };
  /** 수정된 텍스트 업데이트 */
  const onEditParentComment = async ({ parentId, childId = null }: { parentId: string; childId?: string | null }) => {
    let commentRef;
    if (!childId) {
      commentRef = doc(db, `feeds/${articleId}/parentComments`, parentId);
      await updateDoc(commentRef, { comment: parentsState[parentId].comment });
    } else {
      commentRef = doc(db, `feeds/${articleId}/parentComments/${parentId}/childComments`, childId);
      await updateDoc(commentRef, { comment: parentsState[parentId].children[childId].comment });
    }
    return { parentId, childId };
  };
  const { mutate: editParentComment } = useMutation({
    mutationFn: onEditParentComment,
    onSettled: (data) => {
      const parentId = data?.parentId as string;
      const childId = data?.childId;
      if (!childId) {
        queryClient.invalidateQueries({ queryKey: ['parentComments'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['childComments', parentId] });
      }
    },
  });

  const onChangeNewChildText = (commentId: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParentsState((prevState) => {
      return { ...prevState, [commentId]: { ...prevState[commentId], newChildText: e.target.value } as IParentComment };
    });
  };
  const onCreateNewChild = async ({ commentId }: { commentId: string }) => {
    const newChildComment = {
      articleId,
      uid: userUid,
      nickName: userData?.nickName,
      profileImage: userData?.profileImage.comment,
      comment: parentsState[commentId].newChildText,
      like: [],
      createdAt: serverTimestamp(),
      isRemoved: false,
    };
    const newChildRef = collection(db, `feeds/${articleId}/parentComments/${commentId}/childComments`);
    await addDoc(newChildRef, newChildComment);
    return commentId;
  };
  const { mutate: uploadChildComment } = useMutation({
    mutationFn: onCreateNewChild,
    onSettled: (data) => {
      const parentId = data as string;
      queryClient.invalidateQueries({ queryKey: ['childComments', parentId] });
      setParentsState((prevState) => {
        return {
          ...prevState,
          [parentId]: {
            ...prevState[parentId],
            newChildCreateMode: !prevState[parentId].newChildCreateMode,
          } as IParentComment,
        };
      });
    },
  });

  const onChangeChildCreateMode = (parentId: string) => {
    setParentsState((prevState) => {
      return {
        ...prevState,
        [parentId]: {
          ...prevState[parentId],
          newChildCreateMode: !prevState[parentId].newChildCreateMode,
        } as IParentComment,
      };
    });
  };

  const formatDate = (timestampDate: Timestamp) => {
    if (!timestampDate) return;
    const realDate: Date = timestampDate.toDate();
    const year = realDate.getFullYear();
    const month = realDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줌
    const day = realDate.getDate();

    // 한 자리 수 월/일의 경우 앞에 0을 붙여줌
    const showMonth = month < 10 ? '0' + month : month;
    const showDate = day < 10 ? '0' + day : day;

    return `${year}년 ${showMonth}월 ${showDate}일`;
  };
  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <Textarea className="w-[90%]" value={createParentCommentInput} onChange={onChangeCreateParentCommentInput} />
          <Button onClick={() => uploadParentComment()}>작성</Button>
        </div>
        <div className="flex flex-col gap-1">
          {Object.entries(parentsState).map(([id, parentComment]) => {
            const parentId = id;
            const parent = parentComment as IParentComment;
            const isLike = parent?.like.includes(userUid as string);
            const isCommentWriter = parent?.uid === userUid;
            const isView = parent?.mode === 'view';
            const isEdit = parent?.mode === 'edit';
            const isCreateChildMode = parent?.newChildCreateMode;
            const children = parent?.children;
            return (
              <div key={parentId} /* className="border" */>
                <div className="flex items-center gap-5 pl-3 mb-3">
                  <AvatarInComment avatarImageSrc={parent.profileImage} />
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">{parent.nickName}</span>
                    <span className="text-gray-400 text-sm">{formatDate(parent.createdAt as Timestamp)}</span>
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  {isView && (
                    <>
                      <span className="ml-3 mr-3 w-[80%] bg-[#F8FAFC] rounded-md">{parent.comment}</span>
                      <div className="flex gap-3 items-center text-gray-500">
                        {isLike ? (
                          <FcLike onClick={() => likeComment({ parentId: parentId, type: 'removeLike' })} />
                        ) : (
                          <FaRegHeart onClick={() => likeComment({ parentId: parentId, type: 'addLike' })} />
                        )}
                        {isCommentWriter && (
                          <>
                            <span
                              className="cursor-pointer"
                              onClick={() => onChangeParentCommentMode(parentId, 'edit')}
                            >
                              수정
                            </span>
                            <span className="cursor-pointer" onClick={() => removeComment({ parentId: parentId })}>
                              삭제
                            </span>
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
                        <span onClick={() => editParentComment({ parentId: parentId })}>저장</span>
                        <span onClick={() => onChangeParentCommentMode(parentId, 'view')}>취소</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="ml-10">
                  {/* 자식 댓글 렌더링 되는 부분 */}
                  {children &&
                    Object.entries(children).map(([childId, childComment]) => {
                      const child = childComment;
                      const isLikeChild = child.like.includes(userUid as string);
                      const isChildCommentWriter = child.uid === userUid;
                      const isViewChild = child.mode === 'view';
                      const isEditChild = child.mode === 'edit';
                      return (
                        <div key={childId}>
                          <div className="flex items-center gap-5 mb-3">
                            <AvatarInComment avatarImageSrc={child.profileImage} />
                            {child.nickName}
                          </div>
                          <div className="flex justify-between">
                            {isViewChild && (
                              <>
                                <span className="ml-3 mr-3 w-[80%] bg-[#F8FAFC] rounded-md">{child.comment}</span>
                                <div className="flex gap-3 items-center text-gray-500">
                                  {isLikeChild ? (
                                    <FcLike
                                      onClick={() =>
                                        likeComment({ parentId: parentId, childId: childId, type: 'removeLike' })
                                      }
                                    />
                                  ) : (
                                    <FaRegHeart
                                      onClick={() =>
                                        likeComment({ parentId: parentId, childId: childId, type: 'addLike' })
                                      }
                                    />
                                  )}
                                  {isChildCommentWriter && (
                                    <>
                                      <span onClick={() => onChangeChildCommentMode(parentId, childId, 'edit')}>
                                        수정
                                      </span>
                                      <span onClick={() => removeComment({ parentId: parentId, childId: childId })}>
                                        삭제
                                      </span>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                            {isEditChild && (
                              <>
                                <Textarea
                                  value={parentsState[parentId].children[childId].comment}
                                  onChange={(e) => onChangeChildCommentEditText(parentId, childId, e)}
                                />
                                <div className="flex">
                                  <span onClick={() => editParentComment({ parentId: parentId, childId: childId })}>
                                    저장
                                  </span>
                                  <span onClick={() => onChangeChildCommentMode(parentId, childId, 'view')}>취소</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  <span className="flex items-center gap-2" onClick={() => onChangeChildCreateMode(parentId)}>
                    <BsArrowReturnRight />
                    {`댓글 추가하기`}
                  </span>
                  {/* 대댓글 추가하기 활성화 될 때 */}
                  {isCreateChildMode && (
                    <div className="flex items-center">
                      <Textarea
                        value={parentsState[parentId].newChildText}
                        onChange={(e) => onChangeNewChildText(parentId, e)}
                      />
                      <Button onClick={() => uploadChildComment({ commentId: parentId })}>저장</Button>
                    </div>
                  )}
                </div>
                <hr />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CommentsContainer;
