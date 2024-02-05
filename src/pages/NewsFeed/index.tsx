import ArticleWrap from '@/components/Wrap/ArticleWrap';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { collection, getDocs, orderBy, query } from '@firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/avatar';
import AvatarInCard from '@/components/Avatar/AvatarInCard';

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

  const contentToText = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent?.substring(0, 100);
  };

  return (
    <PageWrap>
      <ContentWrap>
        {newsfeed?.map((feed, index) => {
          return (
            <ArticleWrap key={`newsfeed-${index}`}>
              <div className="flex items-center gap-5">
                <Avatar className="w-12 h-12">
                  <AvatarInCard avatarImageSrc={feed.profileImage} />
                </Avatar>
                <span className="font-bold">{feed.nickName}</span>
              </div>
              <div>{feed.title}</div>
              <div>
                {contentToText(feed.content)}
                <span className="text-gray-500 font-bold"> ...더보기</span>
              </div>
            </ArticleWrap>
          );
        })}
      </ContentWrap>
    </PageWrap>
  );
};

export default Newsfeed;
