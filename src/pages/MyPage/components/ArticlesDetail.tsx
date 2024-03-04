import { IArticle, fetchUsersArticles } from '@/apis/feed';
import { useQuery } from '@tanstack/react-query';
import ArticleCard from './ArticleCard';
import { useParams } from 'react-router';

const ArticlesDetail = () => {
  const { userUid: targetUserUid } = useParams();
  const { data: articles } = useQuery({
    queryKey: ['usersArticles', targetUserUid!],
    queryFn: fetchUsersArticles,
    staleTime: 1 * 60 * 1000,
  });

  return (
    <>
      {articles?.map((article: IArticle) => {
        return <ArticleCard key={article.articleId} article={article} />;
      })}
    </>
  );
};

export default ArticlesDetail;
