import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';
import { db } from '@/firebase/firebase';
import { IFeed } from '@/types/common';
import { arrayRemove, arrayUnion, deleteDoc, doc, getDoc, updateDoc } from '@firebase/firestore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import Comments from './CommentsContainer';
// import Comments from './CommentsContainer';

interface ILikeFuncArg {
  type: string;
}

const Article = () => {
  const params = useParams();
  const articleId = params.articleId;
  const [myArticle, setMyArticle] = useState(false);

  const { userUid, userData } = useUserUid();
  console.log(userData);

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const fetchArticle = async (): Promise<IFeed> => {
    const articleRef = doc(db, 'feeds', articleId as string);
    const article = (await getDoc(articleRef)).data() as IFeed;
    if (userUid === article.uid) {
      setMyArticle(true);
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['article'] });
      const previousArticleState = queryClient.getQueryData(['article']);
      queryClient.setQueryData(['article'], (oldState: IFeed) => {
        let newLike = [];
        if (oldState.like.includes(userUid as string)) {
          newLike = oldState.like.filter((uid) => uid !== userUid);
        } else {
          oldState.like.push(userUid as string);
          newLike = oldState.like;
        }
        return { ...oldState, like: newLike };
      });
      return { previousArticleState };
    },
    onError: (error, _product, context) => {
      console.log(error);
      queryClient.setQueryData(['article'], context?.previousArticleState);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['article'] });
    },
  });

  const onRemoveArticle = async () => {
    try {
      const articleRef = doc(db, 'feeds', articleId as string);
      await deleteDoc(articleRef);
      console.log(`articleId : ${articleId}에 해당하는 게시글이 삭제 되었습니다.`);
    } catch (error) {
      console.log(error);
    }
  };
  const { mutate: removeArticle } = useMutation({
    mutationFn: onRemoveArticle,
    // 삭제 성공 시 newsFeed로 이동
    onSuccess: () => {
      console.log(`sssssss`);
      queryClient.invalidateQueries({ queryKey: ['article'] });
      navigate('/newsfeed');
    },
  });

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
            <div onClick={() => onLikeArticle({ type: 'removeLike' })}>안좋아요^^</div>
          ) : (
            <div onClick={() => onLikeArticle({ type: 'addLike' })}>좋아요</div>
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
        <Comments articleId={articleId!} />
      </ContentWrap>
    </PageWrap>
  );
};

export default Article;
