import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

interface ILikeFuncArg {
  articleId: string;
  type: string;
}

export const useArticleLike = () => {
  const { userUid } = useUserUid();
  const queryClient = useQueryClient();

  const articleLikeHandler = async ({ articleId, type }: ILikeFuncArg) => {
    const command = type === 'addLike' ? arrayUnion : arrayRemove;

    const myDocRef = doc(db, 'users', userUid!);
    await updateDoc(myDocRef, { like: command(articleId) });

    const articleRef = doc(db, 'feeds', articleId);
    await updateDoc(articleRef, { like: command(userUid) });
  };

  return useMutation({
    mutationFn: articleLikeHandler,
    onMutate: async ({ articleId }) => {
      await queryClient.cancelQueries({ queryKey: ['newsfeed'] });
      await queryClient.cancelQueries({ queryKey: ['article', articleId] });
      const previousNewsfeedState = queryClient.getQueryData(['newsfeed']);
      const previousArticleState = queryClient.getQueryData(['article', articleId]);

      // newfeed 쿼리 키에 대한 optimistic update
      queryClient.setQueryData(['newsfeed'], (oldState: [string, IFeed][]) => {
        const newState = oldState.map(([id, article]) => {
          if (id === articleId) {
            let newLike = [];
            if (article.like.includes(userUid!)) {
              newLike = article.like.filter((uid: string) => uid !== userUid);
            } else {
              newLike = [...article.like, userUid];
            }
            return [id, { ...article, like: newLike }];
          } else {
            return [id, article];
          }
        });
        return newState;
      });

      // ['article', articleId] 쿼리 값이 캐시되어 있지않은 경우를 제외(게시글 목록)
      if (previousArticleState) {
        // article 쿼리 키에 대한 optimistic update
        queryClient.setQueryData(['article', articleId], (oldState: IFeed) => {
          let newLike = [];
          if (oldState.like.includes(userUid as string)) {
            newLike = oldState.like.filter((uid) => uid !== userUid);
          } else {
            oldState.like.push(userUid as string);
            newLike = oldState.like;
          }
          return { ...oldState, like: newLike };
        });
      }

      return { previousNewsfeedState, previousArticleState };
    },
    onError: (error, product, context) => {
      console.log(error);
      const articleId = product.articleId;
      queryClient.setQueryData(['newsfeed'], context?.previousNewsfeedState);
      queryClient.setQueryData(['article', articleId], context?.previousArticleState);
    },
    onSettled: async (_data, _error, variables) => {
      const articleId = variables.articleId;
      await queryClient.invalidateQueries({ queryKey: ['newsfeed'] });
      await queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });
};
