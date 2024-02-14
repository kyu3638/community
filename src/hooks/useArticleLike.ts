import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

interface ILikeFuncArg {
  articleId: string;
  type: string;
}

export const useArticleLike = (userUid: string) => {
  const queryClient = useQueryClient();

  const articleLikeHandler = async ({ articleId, type }: ILikeFuncArg) => {
    console.log(`여기까지 도달했는가`);
    const command = type === 'addLike' ? arrayUnion : arrayRemove;

    const myDocRef = doc(db, 'users', userUid);
    await updateDoc(myDocRef, { like: command(articleId) });

    const articleRef = doc(db, 'feeds', articleId);
    await updateDoc(articleRef, { like: command(userUid) });
    console.log(queryClient.getQueryData(['newsfeed']));
  };

  return useMutation({
    mutationFn: articleLikeHandler,
    onMutate: async ({ articleId }) => {
      await queryClient.cancelQueries({ queryKey: ['newsfeed'] });
      await queryClient.cancelQueries({ queryKey: ['article', articleId] });
      const previousNewsfeedState = queryClient.getQueryData(['newsfeed']);
      const previousArticleState = queryClient.getQueryData(['article', articleId]);
      console.log('newsfeed', previousNewsfeedState);
      console.log('article', previousArticleState);

      // newfeed 쿼리 키에 대한 optimistic update
      if (previousNewsfeedState) {
        queryClient.setQueryData(['newsfeed'], (oldState: [string, IFeed][]) => {
          const newState = oldState.map(([id, article]) => {
            if (id === articleId) {
              let newLike = [];
              if (article.like.includes(userUid)) {
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
      }

      // article 쿼리 키에 대한 optimistic update
      if (previousArticleState) {
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
    onError: (error, _product, context) => {
      console.log(error);
      queryClient.setQueryData(['article'], context?.previousArticleState);
    },
    onSettled: (_data, _error, variables) => {
      const articleId = variables.articleId;
      queryClient.invalidateQueries({ queryKey: ['newsfeed'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });
};
