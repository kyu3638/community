import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChangeEvent, useState } from 'react';

interface ICommentsProps {
  articleId: string;
}

const Comments = ({ articleId }: ICommentsProps) => {
  console.log(articleId);
  const [comment, setComment] = useState('');

  const onCommentHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  return (
    <>
      <div className="flex items-center">
        <Textarea value={comment} onChange={onCommentHandler} />
        <Button>작성</Button>
      </div>
    </>
  );
};

export default Comments;
