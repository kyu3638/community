import { IUser } from '@/types/common';
import ContentWrap from '@/components/Wrap/ContentWrap';
import AvatarInProfile from '@/components/Avatar/AvatarInProfile';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { auth, db } from '@/firebase/firebase';
import { User, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useUserUid } from '@/contexts/LoginUserState';
import { isValid } from '../SignUpStepOne';

interface IUserProps {
  user: IUser | null;
}

const Profile = ({ user }: IUserProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [nickName, setNickName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  const { userUid } = useUserUid();

  const onEditModeHandler = async () => {
    setNickName(user?.nickName as string);
    setIntroduction(user?.introduction as string);
    setIsEdit((prev) => !prev);
  };

  /** 닉네임 수정 감지 */
  const onNickNameChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickName(e.target.value);
  };

  /** 비밀번호 수정 감지 */
  const onPasswordChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  /** 비밀번호 확인 수정 감지 */
  const onCheckPasswordChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckPassword(e.target.value);
  };

  /** 소개말 수정 감지 */
  const onIntroductionChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntroduction(e.target.value);
  };

  const onEditProfileHandler = async () => {
    try {
      // 비밀번호 업데이트
      const user = auth.currentUser;
      // 1)이메일 유효성 검사 할 것
      if (!isValid(password, checkPassword)) {
        return;
      }
      const newPassword = password;
      await updatePassword(user as User, newPassword);
      // 닉네임, 소개말 업데이트
      const myDocRef = doc(db, 'users', userUid as string);
      await updateDoc(myDocRef, { nickName, introduction });
      // isEdit -> false
      setIsEdit((prev) => !prev);
      location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ContentWrap>
      <div className="flex gap-10 relative">
        <Avatar className="w-48 h-48">
          <AvatarInProfile avatarImageSrc={user?.profileImage} />
        </Avatar>
        <div className="flex-grow">
          {isEdit ? (
            <>
              <span>닉네임</span>
              <Input type="text" value={nickName} onChange={onNickNameChangeHandler} />
              <span>비밀번호</span>
              <Input type="password" value={password} onChange={onPasswordChangeHandler} />
              <span>비밀번호 확인</span>
              <Input type="password" value={checkPassword} onChange={onCheckPasswordChangeHandler} />
              <span>소개말</span>
              <Textarea value={introduction} onChange={onIntroductionChangeHandler} />
            </>
          ) : (
            <>
              <div>닉네임 : {user?.nickName}</div>
              <div>소개말 : {user?.introduction}</div>
            </>
          )}
          <div>팔로워 : {user?.follower.length}</div>
          <div>팔로잉 : {user?.following.length}</div>
        </div>
        {isEdit ? (
          <Button onClick={onEditProfileHandler} className="absolute right-0 top-0">
            수정 완료
          </Button>
        ) : (
          <Button onClick={onEditModeHandler} className="absolute right-0 top-0">
            프로필 수정
          </Button>
        )}
      </div>
      <div className="flex gap-10">
        <div>팔로워</div>
        <div>팔로잉</div>
        <div>작성한 글</div>
        <div>작성한 댓글</div>
      </div>
    </ContentWrap>
  );
};

export default Profile;
