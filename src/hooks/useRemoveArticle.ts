import { onRemoveArticle } from '@/apis/feed';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

export const useRemoveArticle = (articleId: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => onRemoveArticle(articleId),
    // 삭제 성공 시 newsFeed로 이동
    onSuccess: () => {
      navigate('/');
    },
  });
};
