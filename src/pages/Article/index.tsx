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
import { Timestamp } from 'firebase/firestore';
import Metadatas from '@/metadatas/Metadatas';

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

  const formatDate = (timestampDate: Timestamp) => {
    console.log(timestampDate);
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

  const pureText = (text: string | undefined) => {
    if (text) return text.replace(/(<([^>]+)>)/gi, '');
    return '';
  };

  return (
    <PageWrap>
      <ContentWrap>
        {/* meta */}
        <Metadatas title={`${article?.title || ''}`} desc={pureText(article?.content)} />
        <div className="relative flex items-center gap-5">
          <AvatarInCard avatarImageSrc={article?.profileImage} />
          <div className="flex flex-col">
            <span className="text-lg font-bold">{article?.nickName}</span>
            <span className="text-gray-400">{formatDate(article?.createdAt as Timestamp)}</span>
          </div>
          {myArticle && (
            <div className="absolute top-5 right-5 flex gap-2">
              <Link to={`/posting`} state={{ mode: 'edit', article: article, articleId: articleId }}>
                <Button>수정</Button>
              </Link>
              <Button onClick={() => removeArticle()}>삭제</Button>
            </div>
          )}
        </div>
        <div className="font-bold text-xl pl-2c">{article?.title}</div>
        <hr />
        <div className="ql-snow">
          <div className="ql-editor" dangerouslySetInnerHTML={{ __html: article?.content as string }} />
        </div>
        <div className="flex items-center gap-2 relative text-sm text-gray-700">
          {article?.like.includes(userUid as string) ? (
            <FcLike onClick={() => likeArticle({ articleId: articleId, type: 'removeLike' })} />
          ) : (
            <FaRegHeart onClick={() => likeArticle({ articleId: articleId, type: 'addLike' })} />
          )}
          <span className="flex gap-2">좋아요</span>
          <span>{article?.like.length}</span>
        </div>
        <CommentsContainer articleId={articleId!} />
      </ContentWrap>
    </PageWrap>
  );
};

export default Article;
