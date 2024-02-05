import ArticleWrap from '@/components/Wrap/ArticleWrap';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { db } from '@/firebase/firebase';
import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/avatar';
import AvatarInCard from '@/components/Avatar/AvatarInCard';
import { Link } from 'react-router-dom';

const Newsfeed = () => {
  const fetchNewsfeed = async () => {
    try {
      const collectionRef = collection(db, 'feeds');
      const q = query(collectionRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = (await getDocs(q)).docs;
      return querySnapshot;
      // const feeds = querySnapshot.map((feed) => feed.data()) as IFeed[];
      // return feeds;
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
        {newsfeed?.map((query, index) => {
          const feed = query.data();
          const feedId = query.id;

          return (
            <ArticleWrap key={`newsfeed-${index}`}>
              <Link to={`/search-user/${feed.uid}`}>
                <div className="flex items-center gap-5">
                  <Avatar className="w-12 h-12">
                    <AvatarInCard avatarImageSrc={feed.profileImage} />
                  </Avatar>
                  <span className="font-bold">{feed.nickName}</span>
                </div>
              </Link>
              <div>{feed.title}</div>
              <Link to={`/article/${feedId}`}>
                {contentToText(feed.content)}
                <span className="text-gray-500 font-bold"> ...더보기</span>
              </Link>
            </ArticleWrap>
          );
        })}
      </ContentWrap>
    </PageWrap>
  );
};

export default Newsfeed;
