import PageWrap from '@/components/Wrap/PageWrap';
import EditorWrap from '@/components/Wrap/EditorWrap';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db, storage } from '@/firebase/firebase';
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import { useUserUid } from '@/contexts/LoginUserState';
import { RangeStatic } from 'quill';
import { addDoc, collection, doc, getDoc, updateDoc } from '@firebase/firestore';
import { IFeed, IUser } from '@/types/common';
import { useLocation, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Posting = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { mode, article, articleId } = location.state || {};
  const quillRef = useRef<ReactQuill>(null);
  const [nickName, setNickName] = useState(article?.nickName || '');
  const [profileImage, setProfileImage] = useState(article?.profileImage || '');
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [images, setImages] = useState<string[]>(article?.images || []);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(mode);
    console.log(article);
  }, []);

  const { userUid } = useUserUid();

  useEffect(() => {
    // 유저 닉네임과 이미지 url 불러오기
    const getUser = async () => {
      const userRef = doc(db, 'users', userUid as string);
      const user = (await getDoc(userRef)).data() as IUser;
      setNickName(user.nickName);
      setProfileImage(user.profileImage);
    };
    getUser();
  }, []);

  const handleImage = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const storageRef = ref(storage, `postImage/${userUid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downLoadURL = await getDownloadURL(storageRef);
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection() as RangeStatic;
          const newRange = { ...range, index: range.index + 1 };
          editor.insertEmbed(range.index, 'image', downLoadURL);
          editor.setSelection(newRange);
        }
        setImages((prev) => [...prev, downLoadURL]);
      }
    };
  };

  useEffect(() => {
    console.log(images);
  }, [images]);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: handleImage,
        },
      },
    };
  }, []);

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
  ];

  const onPostUploadHandler = async () => {
    try {
      console.log(title);
      console.log(content);
      const newFeed: IFeed = {
        uid: userUid,
        nickName: nickName,
        profileImage: profileImage,
        title: title,
        content: content,
        like: article?.like || [],
        images: images,
        createdAt: article?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      // 새글 생성일 경우 새로운 doc add
      if (mode === 'create') {
        const docRef = collection(db, 'feeds');
        await addDoc(docRef, newFeed);
      }
      // 수정일 경우 기존 doc update
      if (mode === 'edit') {
        const docRef = doc(db, 'feeds', articleId);
        await updateDoc(docRef, { ...newFeed });
        console.log(`게시글이 업데이트 되었습니다.`);
      }
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };
  const { mutate: uploadNewfeed } = useMutation({
    mutationFn: onPostUploadHandler,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['article'] });
    },
  });

  return (
    <PageWrap>
      <EditorWrap>
        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
        />
        {mode === 'create' ? (
          <Button variant="outline" onClick={() => uploadNewfeed()}>
            저장
          </Button>
        ) : (
          <Button variant="outline" onClick={() => uploadNewfeed()}>
            수정
          </Button>
        )}
      </EditorWrap>
    </PageWrap>
  );
};

export default Posting;
