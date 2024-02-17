import { IArticle } from '@/apis/feed';
import { db } from '@/firebase/firebase';
import { useQueries, useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import loadingImage from '/loading.gif';
import { Button } from '@/components/ui/button';
import { useRemoveArticle } from '@/hooks/useRemoveArticle';
import { useLocation } from 'react-router';

const ArticleCard = ({ article }: { article: IArticle }) => {
  const [lenOfComments, setLenOfComments] = useState<number>();

  const articleId = article.articleId;

  const location = useLocation();

  const fetchParent = async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const articleId = queryKey[1];
      const parentCommentsRef = collection(db, `feeds/${articleId}/parentComments`);
      const querySnapshot = (await getDocs(parentCommentsRef)).docs;
      const parentIds = querySnapshot.map((doc) => doc.id);
      return parentIds;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: parentIds, isSuccess } = useQuery({
    queryKey: ['articleParentComments', articleId],
    queryFn: fetchParent,
  });

  const fetchChildren = async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const [articleId, parentId] = [queryKey[1], queryKey[2]];
      const childCommentsRef = collection(db, `feeds/${articleId}/parentComments/${parentId}/childComments`);
      const querySnapShot = (await getDocs(childCommentsRef)).docs;
      const countChildren = querySnapShot.length;
      return countChildren;
    } catch (error) {
      console.log(error);
    }
  };
  const combinedChildren = useQueries({
    queries:
      parentIds?.map((parentId) => ({
        queryKey: ['articleChildComments', articleId, parentId],
        queryFn: fetchChildren,
        enabled: !!parentIds,
      })) || [],
  });

  useEffect(() => {
    if (parentIds && isSuccess && combinedChildren.every((query) => query.isSuccess)) {
      const parentCount = parentIds?.length;
      const childCount = combinedChildren.reduce((acc, cur) => acc + Number(cur.data), 0);
      setLenOfComments(parentCount + childCount);
    }
  }, [parentIds, combinedChildren]);

  const { mutate: removeArticle } = useRemoveArticle(articleId, location.pathname);

  return (
    <div className="relative border-black border-t border-b my-[10px] p-[10px] pl-[20px] flex flex-col gap-3 bg-gray-100">
      <h1 className="font-bold">{article.title}</h1>
      <div className="flex gap-5 text-sm">
        <div className="flex items-center gap-3">
          <span>좋아요 </span>
          <span className="font-bold">{article.like.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>댓글 </span>
          <span className="font-bold">
            {isSuccess && combinedChildren.every((query) => query.isSuccess) ? (
              <>{lenOfComments}</>
            ) : (
              <img className="w-3 h-3" src={loadingImage} />
            )}
          </span>
        </div>
      </div>
      <div className="absolute top-5 right-5 flex gap-3">
        <Button>수정</Button>
        <Button onClick={() => removeArticle()}>삭제</Button>
      </div>
    </div>
  );
};

export default ArticleCard;
