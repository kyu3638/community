import PageWrap from '@/components/Wrap/PageWrap';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db, storage } from '@/firebase/firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from '@firebase/storage';
import { useUserUid } from '@/contexts/LoginUserState';
import { RangeStatic } from 'quill';
import { collection, doc, getDoc, updateDoc } from '@firebase/firestore';
import { IFeed, IUser, uploadImage } from '@/types/common';
import { useLocation, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setDoc } from 'firebase/firestore';
import ContentWrap from '@/components/Wrap/ContentWrap';
import Metadatas from '@/metadatas/Metadatas';

const Posting = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { mode, article, articleId } = location.state || {};
  const quillRef = useRef<ReactQuill>(null);
  const [nickName, setNickName] = useState(article?.nickName || '');
  const [profileImage, setProfileImage] = useState(article?.profileImage || '');
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [imageDataClient, setImageDataClient] = useState(article?.images || []);
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

      let filePath = '';
      if (mode === 'create') {
        filePath = `postImage/${newFeedRef.id}/${file.name}`;
      } else if (mode === 'edit') {
        filePath = `postImage/${articleId}/${file.name}`;
      }
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const downLoadURL = await getDownloadURL(storageRef);

      console.log(`storage 저장 후 url 받아와 객체로 생성`);
      const base64 = reader.result as string;
      setImageDataClient((prev: uploadImage[]) => [...prev, { base64: base64, url: downLoadURL, filePath: filePath }]);
    };
  };

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['image'],
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
    'image',
  ];

  const onPostUploadHandler = async () => {
    try {
      // content에서 base64를 url로 변경
      let newContent = content;
      let editImages = imageDataClient;
      for (const { base64, url, filePath } of imageDataClient) {
        const editUrl = url.replace('&', '&amp;');
        // base64를 포함한 경우
        // url을 포함한 경우
        if (content.includes(base64)) {
          console.log(`삽입된 이미지가 있어 base64 데이터가 있으므로 url로 변경한다.`);
          newContent = newContent.replace(base64, url);
          continue;
        } else if (content.includes(editUrl)) {
          console.log(`기존 이미지가 그대로 있어 url이 있으므로 별도 처리 없이 다음 동작을 진행한다.`);
          continue;
        } else {
          console.log(`base64와 url이 없다는 것은 이미지가 삭제되었다는 의미이므로 state와 storage에서 삭제한다.`);
          editImages = editImages.filter((obj: uploadImage) => obj.base64 !== base64);
          await deleteObject(ref(storage, filePath));
        }
      }
      const newImages = editImages.map((obj: uploadImage) => {
        const url = obj.url;
        const filePath = obj.filePath;
        return { url, filePath };
      });

      const newFeed: IFeed = {
        uid: userUid,
        nickName: nickName,
        profileImage: profileImage,
        title: title,
        content: newContent,
        like: article?.like || [],
        images: newImages,
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
      <ContentWrap>
        <Metadatas title={`새 글 작성`} desc={`코드숲 새 글 작성 페이지입니다.`} />
        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 작성해주세요" />
        <ReactQuill
          className="mb-10"
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="내용을 입력해주세요"
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
      </ContentWrap>
    </PageWrap>
  );
};

export default Posting;
