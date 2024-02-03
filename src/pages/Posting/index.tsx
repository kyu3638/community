import PageWrap from '@/components/Wrap/PageWrap';
import EditorWrap from '@/components/Wrap/EditorWrap';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db, storage } from '@/firebase/firebase';
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage';
import { useUserUid } from '@/contexts/LoginUserState';
import { RangeStatic } from 'quill';
import { addDoc, collection } from '@firebase/firestore';
import { IFeed } from '@/types/common';

const Posting = () => {
  const quillRef = useRef<ReactQuill>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { userUid } = useUserUid();

  const handleImage = async () => {
    console.log(`asdf`);
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
      }
    };
  };

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
      const newFeed: IFeed = {
        uid: userUid,
        title: title,
        content: content,
        comments: [],
        like: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docRef = collection(db, 'feeds');
      await addDoc(docRef, newFeed);
    } catch (error) {
      console.log(error);
    }
  };

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
        <Button variant="outline" onClick={onPostUploadHandler}>
          저장
        </Button>
      </EditorWrap>
    </PageWrap>
  );
};

export default Posting;
