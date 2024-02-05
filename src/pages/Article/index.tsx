import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { doc, getDoc } from '@firebase/firestore';
import { Avatar } from '@radix-ui/react-avatar';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

const Article = () => {
  const params = useParams();
  const articleId = params.articleId;

  const fetchArticle = async () => {
    const articleRef = doc(db, 'feeds', articleId as string);
    const article = (await getDoc(articleRef)).data() as IFeed;
    return article;
  };
  const { data: article } = useQuery({ queryKey: ['article'], queryFn: fetchArticle });
  console.log(article);
  return (
    <PageWrap>
      <ContentWrap>
        <div className="flex items-center gap-5">
          <Avatar className="w-12 h-12">
            <AvatarInCard avatarImageSrc={article?.profileImage} />
          </Avatar>
          <div>{article?.nickName}</div>
        </div>
        <div>{article?.title}</div>
        <div dangerouslySetInnerHTML={{ __html: article?.content as string }} />
      </ContentWrap>
    </PageWrap>
  );
};

export default Article;
