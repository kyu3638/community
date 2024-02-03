import PageWrap from '@/components/Wrap/PageWrap';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

import FroalaEditorComponent from 'react-froala-wysiwyg';
import EditorWrap from '@/components/Wrap/EditorWrap';
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';
import { useState } from 'react';

const Posting = () => {
  const [model, setModel] = useState('Example Set');
  console.log(model);

  const config = {
    placeholderText: '게시글을 여기에 작성해주세요',
  };

  const handleModelChange = (event: any) => {
    setModel(event);
  };

  return (
    <PageWrap>
      <EditorWrap>
        <FroalaEditorComponent tag="textarea" config={config} onModelChange={handleModelChange} />
      </EditorWrap>
      <EditorWrap>
        <FroalaEditorView model={model} />
      </EditorWrap>
    </PageWrap>
  );
};

export default Posting;
