import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import UserCardWrap from '@/components/Wrap/UserCardWrap';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SearchUser = () => {
  const [users, setUsers] = useState<IUser[] | undefined>();

  useEffect(() => {
    /** 페이지 렌더링 시 DB로부터 유저들의 데이터를 바다옵니다. */
    const getUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const usersArr: IUser[] = [];
        querySnapshot.forEach((user) => {
          const userData = JSON.parse(JSON.stringify(user.data()));
          userData.uid = user.id;
          usersArr.push(userData);
        });
        if (usersArr) {
          setUsers(usersArr);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUsers();
  }, []);

  return (
    <PageWrap>
      <ContentWrap>
        <div>
          {users &&
            users.map((user, idx) => {
              return (
                <UserCardWrap key={`search-user-${idx}`}>
                  <Link to={`/search-user/${user.uid}`}>
                    <Avatar className="w-24 h-24">
                      <AvatarInCard avatarImageSrc={user.profileImage} />
                    </Avatar>
                  </Link>
                  <div>
                    <div>닉네임 : {user?.nickName}</div>
                    <div>소개말 : {user?.introduction}</div>
                    <div>좋아요 : {user?.like.length}</div>
                    <div>팔로워 : {user?.follower.length}</div>
                    <div>팔로잉 : {user?.following.length}</div>
                  </div>
                  <div className="absolute right-3 top-3">
                    <div>좋아요</div>
                    <div>팔로우</div>
                  </div>
                </UserCardWrap>
              );
            })}
        </div>
      </ContentWrap>
    </PageWrap>
  );
};

export default SearchUser;
