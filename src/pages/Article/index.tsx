import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { doc, getDoc } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import CommentsContainer from './CommentsContainer';
import { useArticleLike } from '@/hooks/useArticleLike';
import { useRemoveArticle } from '@/hooks/useRemoveArticle';
import { FaRegHeart } from '@react-icons/all-files/fa/FaRegHeart';
import { FcLike } from '@react-icons/all-files/fc/FcLike';

const Article = () => {
  const params = useParams();
  const articleId = params.articleId!;
  const [myArticle, setMyArticle] = useState(false);
  const location = useLocation();

  const { userUid } = useUserUid();

  const fetchArticle = async ({ queryKey }: { queryKey: string[] }): Promise<IFeed> => {
    const articleId = queryKey[1];
    const articleRef = doc(db, 'feeds', articleId as string);
    const article = (await getDoc(articleRef)).data() as IFeed;
    return article;
  };
  const { data: article } = useQuery({ queryKey: ['article', articleId], queryFn: fetchArticle });

  useEffect(() => {
    if (userUid === article?.uid) {
      setMyArticle(true);
    }
  }, [article]);

  const { mutate: likeArticle } = useArticleLike();

  const { mutate: removeArticle } = useRemoveArticle(articleId, article!, location.pathname);

  return (
    <PageWrap>
      <ContentWrap>
        <div className="flex items-center gap-5">
          <AvatarInCard avatarImageSrc={article?.profileImage} />
          <div>{article?.nickName}</div>
        </div>
        <div>{article?.title}</div>
        <div dangerouslySetInnerHTML={{ __html: article?.content as string }} />
        <div className="flex gap-10">
          <div>{article?.like.length}</div>
          {article?.like.includes(userUid as string) ? (
            <div onClick={() => likeArticle({ articleId: articleId, type: 'removeLike' })}>
              <FcLike />
            </div>
          ) : (
            <div onClick={() => likeArticle({ articleId: articleId, type: 'addLike' })}>
              <FaRegHeart />
            </div>
          )}
        </div>
        {myArticle && (
          <div>
            <Link to={`/posting`} state={{ mode: 'edit', article: article, articleId: articleId }}>
              <Button>수정</Button>
            </Link>
            <Button onClick={() => removeArticle()}>삭제</Button>
          </div>
        )}
        <CommentsContainer articleId={articleId!} />
      </ContentWrap>
    </PageWrap>
  );
};

export default Article;
