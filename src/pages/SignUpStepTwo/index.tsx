import { useUserUid } from '@/contexts/LoginUserState';
import { doc, updateDoc } from 'firebase/firestore';
import { InputsForm, LoginInput } from '../Login';
import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import AuthPageWrap from '@/components/Wrap/AuthPageWrap';
import AvatarInCard from '@/components/Avatar/AvatarInCard';
import unknownImage from '/unknown.png';
import { FaRegImage } from 'react-icons/fa';
import AvatarInSignUp from '@/components/Avatar/AvatarInSignUp';

const SignUpStepTwo = () => {
  const [nickName, setNickName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState(unknownImage);
  const { userUid, updateUserUid } = useUserUid();

  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      updateUserUid(auth.currentUser.uid);
    } else {
      navigate('/');
    }
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
  useEffect(() => {
    const handleUpload = async () => {
      if (selectedFile) {
        const imageRef = ref(storage, `userImage/${userUid}/${selectedFile.name}`);
        await uploadBytes(imageRef, selectedFile);
        // storage에서 파일의 url
        const downloadURL = await getDownloadURL(imageRef);
        setImageURL(downloadURL);
      }
    };
    handleUpload();
  }, [selectedFile]);

  // const handleUpload = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   console.log(e);
  //   e.preventDefault();
  //   if (selectedFile) {
  //     const imageRef = ref(storage, `userImage/${userUid}/${selectedFile.name}`);
  //     await uploadBytes(imageRef, selectedFile);
  //     // storage에서 파일의 url
  //     const downloadURL = await getDownloadURL(imageRef);
  //     setImageURL(downloadURL);
  //   }
  // };

  const signUpHandler = async () => {
    try {
      const newData = {
        nickName: nickName,
        introduction: introduction,
        profileImage: imageURL,
        updatedAt: new Date(),
      };
      if (userUid) {
        const docRef = doc(db, 'users', userUid);
        await updateDoc(docRef, newData).then(() => {
          console.log(`유저 정보가 업데이트 되었습니다.`);
          navigate('/');
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthPageWrap>
      <div className="flex flex-col justify-center items-center gap-5 w-[350px]">
        <div className="text-xl font-extrabold">회원가입 step 2</div>
        <div className="relative flex flex-col gap-0">
          <div className="text-l font-bold">프로필 이미지</div>
          <AvatarInSignUp avatarImageSrc={imageURL} />
          <label className="input-file-button absolute right-[9px] bottom-[9px] cursor-pointer" htmlFor="input-file">
            <FaRegImage size="35" />
          </label>
        </div>
        <input className="hidden" id="input-file" type="file" onChange={onHandleFileSelect} />
        {/* <button onClick={handleUpload}>Upload</button> */}
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
        <div className="flex flex-col gap-2">
          <button onClick={signUpHandler}>완료</button>
        </div>
      </div>
    </AuthPageWrap>
  );
};

export default SignUpStepTwo;
