import { IArticle, onRemoveArticle } from '@/apis/feed';
import { useUserUid } from '@/contexts/LoginUserState';
import { IFeed } from '@/types/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

export const useRemoveArticle = (articleId: string, article: IFeed, currentPath: string) => {
  const { userUid } = useUserUid();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pathToArr = currentPath.split('/').filter((v) => v !== '');
  const isNewsfeed = pathToArr[0] === 'article';
  return useMutation({
    mutationFn: () => onRemoveArticle(articleId, article),
    // 삭제 성공 시 newsFeed로 이동
    onMutate: async () => {
      // const articleId = variables.articleId;
      await queryClient.cancelQueries({ queryKey: ['usersArticles', userUid!] });
      const previousData = queryClient.getQueryData(['usersArticles', userUid!]);
      if (previousData) {
        queryClient.setQueryData(['usersArticles', userUid!], (articles: IArticle[]) => {
          return articles.filter((article) => article.articleId !== articleId);
        });
      }

      return { previousData };
    },
    onError: (error, __variables, context) => {
      console.log(error);
      console.log(context);
      queryClient.setQueryData(['usersArticles', userUid!], context?.previousData);
    },
    onSuccess: () => {
      if (isNewsfeed) {
        navigate('/');
      } else {
        navigate(currentPath);
      }
    },
  });
};
