import { IArticle, fetchUsersArticles } from '@/apis/feed';
import { useUserUid } from '@/contexts/LoginUserState';
import { useQuery } from '@tanstack/react-query';
import ArticleCard from './ArticleCard';

const ArticlesDetail = () => {
  const { userUid } = useUserUid();

  const { data: articles } = useQuery({
    queryKey: ['usersArticles', userUid!],
    queryFn: fetchUsersArticles,
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
