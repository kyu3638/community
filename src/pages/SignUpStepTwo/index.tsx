import { useUserUid } from '@/contexts/LoginUserState';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import AuthPageWrap from '@/components/Wrap/AuthPageWrap';
import unknownImage from '/unknown.png';
import { FaRegImage } from '@react-icons/all-files/fa/FaRegImage';
import { FaUser } from '@react-icons/all-files/fa/FaUser';
import AvatarInSignUp from '@/components/Avatar/AvatarInSignUp';
import { Textarea } from '@/components/ui/textarea';
import { PiPencilLineBold } from 'react-icons/pi';
import { Input } from '@/components/ui/input';

const SignUpStepTwo = () => {
  const [nickName, setNickName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState('');
  const [imagePreviewURL, setImagePreviewURL] = useState(unknownImage);
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
  const onChangeIntroduction = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntroduction(e.target.value);
  };

  const onHandleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const tempURL = URL.createObjectURL(file);
      setImagePreviewURL(tempURL);
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    const handleUpload = async () => {
      if (selectedFile) {
        const imageRef = ref(storage, `userImage/${userUid}/${selectedFile.name}`);
        await uploadBytes(imageRef, selectedFile);
        const downloadURL = await getDownloadURL(imageRef);
        setImageURL(downloadURL);
      }
    };
    handleUpload();
  }, [selectedFile]);

  useEffect(() => {
    if (imageURL) {
      setImagePreviewURL('');
    }
  }, [imageURL]);

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
        <AvatarInSignUp avatarImageSrc={imageURL || imagePreviewURL} />
        <div className="flex items-center gap-5">
          <div className="text-l font-bold">프로필 이미지</div>
          <label className="input-file-button right-[9px] bottom-[9px] cursor-pointer" htmlFor="input-file">
            <FaRegImage size="35" />
          </label>
          <input className="hidden" id="input-file" type="file" onChange={onHandleFileSelect} />
        </div>
        <div className="flex items-center gap-2 w-full">
          <label>
            <FaUser />
          </label>
          <Input
            data-cy={'nickNameInput'}
            type={'text'}
            placeholder={'닉네임을 입력하세요'}
            value={nickName}
            onChange={onChangeNickName}
          />
        </div>
        <div className="flex items-center gap-2 w-full">
          <label>
            <PiPencilLineBold />
          </label>
          <Textarea
            placeholder={'인사말을 입력하세요'}
            value={introduction}
            onChange={onChangeIntroduction}
            data-cy="introductionInput"
          />
        </div>
        <button className={'bg-[#0F172A] px-5 py-2 rounded-sm text-sm text-white'} onClick={signUpHandler}>
          완료
        </button>
      </div>
    </AuthPageWrap>
  );
};

export default SignUpStepTwo;
