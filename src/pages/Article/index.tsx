import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from '@firebase/firestore';
import { Avatar } from '@radix-ui/react-avatar';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router';

interface ILikeFuncArg {
  type: string;
}

const Article = () => {
  const params = useParams();
  const articleId = params.articleId;
  const [likeArticle, setLikeArticle] = useState(false);

  const { userUid } = useUserUid();

  const fetchArticle = async () => {
    const articleRef = doc(db, 'feeds', articleId as string);
    const article = (await getDoc(articleRef)).data() as IFeed;
    if (article.like.includes(userUid as string)) {
      setLikeArticle(true);
    }
    return article;
  };
  const { data: article } = useQuery({ queryKey: ['article'], queryFn: fetchArticle });

  const articleLikeHandler = async ({ type }: ILikeFuncArg) => {
    try {
      const command = type === 'addLike' ? arrayUnion : arrayRemove;

      const myDocRef = doc(db, 'users', userUid as string);
      await updateDoc(myDocRef, { like: command(articleId) });

      const articleRef = doc(db, 'feeds', articleId as string);
      await updateDoc(articleRef, { like: command(userUid) });
    } catch (error) {
      console.log(error);
    }
  };
  const { mutate: onLikeArticle } = useMutation({
    mutationFn: articleLikeHandler,
  });

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
        {likeArticle ? (
          <div onClick={() => onLikeArticle({ type: 'removeLike' })}>안좋아요^^</div>
        ) : (
          <div onClick={() => onLikeArticle({ type: 'addLike' })}>좋아요</div>
        )}
      </ContentWrap>
    </PageWrap>
  );
};

export default Article;
