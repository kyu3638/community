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
import { collection, doc, getDoc, updateDoc } from '@firebase/firestore';
import { IFeed, IUser } from '@/types/common';
import { useLocation, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setDoc } from 'firebase/firestore';

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
  const [imagesObj, setImagesObj] = useState({});
  const navigate = useNavigate();
  const [newFeedRef] = useState(doc(collection(db, 'feeds')));

  const { userUid } = useUserUid();

  useEffect(() => {
    // 유저 닉네임과 이미지 url 불러오기
    const getUser = async () => {
      const userRef = doc(db, 'users', userUid as string);
      const user = (await getDoc(userRef)).data() as IUser;
      setNickName(user.nickName);
      setProfileImage(user.profileImage.comment);
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
      const reader = new FileReader();
      if (!file || !quillRef.current) return;
      // base64형태로 파일을 띄움
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection() as RangeStatic;
      const newRange = { ...range, index: range.index + 1 };
      reader.readAsDataURL(file);
      reader.onload = () => {
        console.log(`이미지를 base64형태로 삽입`);
        const base64 = reader.result as string;
        editor.insertEmbed(range.index, 'image', base64);
        editor.setSelection(newRange);
      };

      const storageRef = ref(storage, `postImage/${newFeedRef.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downLoadURL = await getDownloadURL(storageRef);

      console.log(`storage 저장 후 url 받아와 객체로 생성`);
      const base64 = reader.result as string;
      setImages((prev) => [...prev, downLoadURL]);
      setImagesObj((prev) => ({ ...prev, [base64]: downLoadURL }));
    };
  };

  useEffect(() => {
    // base64가 있다면 url로 바꿔 줌
    for (const [base64, url] of Object.entries(imagesObj)) {
      if (content.includes(base64)) {
        const encodedFilePath = (url as string).split('/o/')[1].split('?alt=media')[0];
        const filePath = decodeURIComponent(encodedFilePath);
        console.log(`filePath`, filePath);

        // const newContent = content.replace(base64, url);
        // setContent(newContent);
      }
    }
  }, [imagesObj]);

  useEffect(() => {
    console.log(content);
  }, [content]);

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
      // content에서 base64를 url로 변경
      let newContent = content;
      for (const [base64, url] of Object.entries(imagesObj)) {
        if (content.includes(base64)) {
          newContent = newContent.replace(base64, url);
        }
      }

      const newFeed: IFeed = {
        uid: userUid,
        nickName: nickName,
        profileImage: profileImage,
        title: title,
        content: newContent,
        like: article?.like || [],
        images: images,
        createdAt: article?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      // 새글 생성일 경우 새로운 doc add
      if (mode === 'create') {
        const docRef = doc(db, 'feeds', newFeedRef.id);
        await setDoc(docRef, newFeed);
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
