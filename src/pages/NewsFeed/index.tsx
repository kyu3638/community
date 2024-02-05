import ArticleWrap from '@/components/Wrap/ArticleWrap';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';

const Newsfeed = () => {
  const fetchNewsfeed = async () => {
    try {
      const collectionRef = collection(db, 'feeds');
      const q = query(collectionRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = (await getDocs(q)).docs;
      const feeds = querySnapshot.map((feed) => feed.data()) as IFeed[];
      return feeds;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: newsfeed } = useQuery({
    queryKey: ['newsfeed'],
    queryFn: fetchNewsfeed,
  });

  return (
    <PageWrap>
      <ContentWrap>
        {newsfeed?.map((feed, index) => {
          return (
            <ArticleWrap key={`newsfeed-${index}`}>
              <div>{feed.title}</div>
              <div dangerouslySetInnerHTML={{ __html: feed.content }}></div>
            </ArticleWrap>
          );
        })}
      </ContentWrap>
    </PageWrap>
  );
};

export default Newsfeed;
