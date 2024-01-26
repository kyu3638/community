import { useUserUid } from '@/contexts/LoginUserState';
import { doc, updateDoc } from 'firebase/firestore';
import { InputsForm, LoginInput } from '../Login';
import { useEffect, useState } from 'react';
import { db, storage } from '@/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const SignUpStepTwo = () => {
  const [nickName, setNickName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState('');
  const { userUid, isLogin } = useUserUid();

  const navigate = useNavigate();

  useEffect(() => {
    console.log(`2단계 페이지에서 로그인 여부 : `, isLogin);
    console.log(`userUid : ${userUid}`);
  }, []);

  const onChangeNickName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickName(e.target.value);
  };
  const onChangeIntroduction = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntroduction(e.target.value);
  };

  const onHandleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedFile(file);
  };

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e);
    e.preventDefault();
    if (selectedFile) {
      const imageRef = ref(storage, `userImage/${userUid}/${selectedFile.name}`);
      await uploadBytes(imageRef, selectedFile);
      // storage에서 파일의 url
      const downloadURL = await getDownloadURL(imageRef);
      setImageURL(downloadURL);
    }
  };

  const signUpHandler = async () => {
    try {
      const newData = {
        nickName: nickName,
        introduction: introduction,
        profileImage: imageURL,
        updatedAt: new Date(),
      };
      console.log(userUid);
      const docRef = doc(db, 'users', userUid);
      console.log(docRef);
      await updateDoc(docRef, newData).then(() => {
        console.log(`유저 정보가 업데이트 되었습니다.`);
        navigate('/');
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-lvh flex flex-col justify-center items-center">
      <InputsForm>
        <input type="file" onChange={onHandleFileSelect} />
        <button onClick={handleUpload}>Upload</button>
        <LoginInput
          label={'닉네임'}
          type={'text'}
          placeholder={'닉네임을 입력하세요'}
          value={nickName}
          onChange={onChangeNickName}
        />
        <LoginInput
          label={'인사말'}
          type={'text'}
          placeholder={'인사말을 입력하세요'}
          value={introduction}
          onChange={onChangeIntroduction}
        />
      </InputsForm>
      <div className="flex flex-col gap-2">
        <button onClick={signUpHandler}>완료</button>
      </div>
    </div>
  );
};

export default SignUpStepTwo;
