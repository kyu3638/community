import ArticleWrap from '@/components/Wrap/ArticleWrap';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { db } from '@/firebase/firebase';
import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import AvatarInComment from '@/components/Avatar/AvatarInComment';
import { Link } from 'react-router-dom';
import { FaRegHeart } from 'react-icons/fa';
import { useUserUid } from '@/contexts/LoginUserState';
import { FcLike } from 'react-icons/fc';
import { useArticleLike } from '@/hooks/useArticleLike';
import { IFeed } from '@/types/common';

const Newsfeed = () => {
  const { userUid } = useUserUid();
  const { mutate: likeArticle } = useArticleLike();

  const fetchNewsfeed = async () => {
    try {
      const collectionRef = collection(db, 'feeds');
      const q = query(collectionRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = (await getDocs(q)).docs.map((doc) => [doc.id, doc.data()]);
      return querySnapshot;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: newsfeed } = useQuery({
    queryKey: ['newsfeed'],
    queryFn: fetchNewsfeed,
  });

  const contentToText = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent?.substring(0, 100);
  };

  return (
    <PageWrap>
      <ContentWrap>
        {newsfeed?.map((feedIdData, index) => {
          const feedId = feedIdData[0];
          const feed = feedIdData[1] as IFeed;
          const isLike = feed.like.includes(userUid!);
          const countLike = feed.like.length;

          return (
            <ArticleWrap key={`newsfeed-${index}`}>
              <Link to={`/search-user/${feed.uid}`}>
                <div className="flex items-center gap-5">
                  <AvatarInComment avatarImageSrc={feed.profileImage} />
                  <span className="font-bold">{feed.nickName}</span>
                </div>
              </Link>
              <div className="font-bold text-lg">{feed.title}</div>
              <Link to={`/article/${feedId}`}>
                {contentToText(feed.content)}
                <span className="text-gray-500 font-bold"> ...더보기</span>
              </Link>
              <div className="flex gap-2 relative text-sm text-gray-700">
                <span className="flex gap-2">좋아요</span>
                <span>{countLike}</span>
              </div>
              <div>
                {isLike ? (
                  <FcLike onClick={() => likeArticle({ articleId: feedId as string, type: 'removeLike' })} />
                ) : (
                  <FaRegHeart onClick={() => likeArticle({ articleId: feedId as string, type: 'addLike' })} />
                )}
              </div>
            </ArticleWrap>
          );
        })}
      </ContentWrap>
    </PageWrap>
  );
};

export default Newsfeed;
