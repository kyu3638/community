import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import UserCardWrap from '@/components/Wrap/UserCardWrap';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';

interface IFollowingObj {
  [userUid: string]: boolean;
}

const SearchUser = () => {
  const [users, setUsers] = useState<IUser[] | undefined>();
  const [searchNickName, setSearchNickName] = useState<string>('');
  const [following, setFollowing] = useState<IFollowingObj>();

  const { userUid } = useUserUid();

  const onChangeSearchNickName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchNickName(e.target.value);
  };

  const onSearchNickname = async () => {
    try {
      const searchResult: IUser[] | undefined = [];
      const querySanpshot = (await getDocs(collection(db, 'users'))).docs;
      querySanpshot.forEach((doc) => {
        const userNick = JSON.parse(JSON.stringify(doc.data())).nickName;
        if (userNick.includes(searchNickName)) {
          searchResult.push(JSON.parse(JSON.stringify(doc.data())));
        }
        console.log('searchNickName : ', searchResult);
      });
      if (searchResult.length === 0) {
        alert('조회된 유저가 없습니다.');
      } else {
        setUsers(searchResult);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  // 내 정보에 대한 DB를 받아오고 내가 팔로우 하는 사람들의 정보로 follow하고 있는지 객체를 만든다.
  useEffect(() => {
    const getFollowing = async () => {
      const myDBRef = doc(db, 'users', userUid as string);
      const myDoc = await getDoc(myDBRef);
      const myFollowing = myDoc.get('following');
      const followingObj: IFollowingObj = {};
      users?.forEach((user) => {
        if (myFollowing.includes(user)) {
          followingObj[user.uid] = true;
          console.log(`내가 팔로우하는 유저`);
        } else {
          followingObj[user.uid] = false;
          console.log(`내가 팔로우하지 않는 유저`);
        }
      });
      setFollowing(followingObj);
    };
    getFollowing();
  }, [users]);

  useEffect(() => {
    console.log(following);
  }, [following]);
  return (
    <PageWrap>
      <ContentWrap>
        <div className="flex">
          <Input type="text" placeholder="검색할 유저 ID" value={searchNickName} onChange={onChangeSearchNickName} />
          <Button variant="outline" onClick={onSearchNickname}>
            검색
          </Button>
        </div>
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
