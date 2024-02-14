import { db } from '@/firebase/firebase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

export const useArticleLike = (userUid: string) => {
  const queryClient = useQueryClient();

  const articleLikeHandler = async ({ articleId, type }: { articleId: string; type: string }) => {
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
    // onMutate: async ({ articleId }) => {
    //   await queryClient.cancelQueries({ queryKey: ['article', articleId] });
    //   const previousArticleState = queryClient.getQueryData(['article', articleId]);
    //   console.log(previousArticleState);
    //   queryClient.setQueryData(['article'], (oldState: IFeed) => {
    //     console.log(oldState);
    //     let newLike = [];
    //     if (oldState.like.includes(userUid as string)) {
    //       newLike = oldState.like.filter((uid) => uid !== userUid);
    //     } else {
    //       oldState.like.push(userUid as string);
    //       newLike = oldState.like;
    //     }
    //     return { ...oldState, like: newLike };
    //   });
    //   return { previousArticleState };
    // },
    // onError: (error, _product, context) => {
    //   console.log(error);
    //   queryClient.setQueryData(['article'], context?.previousArticleState);
    // },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['newsfeed'] });
      //   queryClient.invalidateQueries({ queryKey: ['article'] });
    },
  });
};
