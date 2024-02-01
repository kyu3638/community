import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import UserCardWrap from '@/components/Wrap/UserCardWrap';
import { Avatar } from '@/components/ui/avatar';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useUserUid } from '@/contexts/LoginUserState';
import { QueryFunctionContext, QueryKey, useQuery } from '@tanstack/react-query';

interface IFollowingObj {
  [userUid: string]: boolean;
}

const SearchUser = () => {
  const [searchNickName, setSearchNickName] = useState<string>('');
  const [following, setFollowing] = useState<IFollowingObj>();

  const { userUid } = useUserUid();

  const onChangeSearchNickName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchNickName(e.target.value);
  };

  /** 최초 페이지 접근 시 전체 유저를 렌더링 */
  const fetchUsers = async () => {
    try {
      const collectionRef = collection(db, 'users');
      const querySnapshot = (await getDocs(collectionRef)).docs;
      const users: IUser[] = [];
      querySnapshot.forEach((user) => {
        const userData = user.data() as IUser;
        users.push(userData);
      });
      return users;
    } catch (error) {
      console.log(error);
    }
  };
  // 검색어 없을 때만 활성화
  const { data: users } = useQuery({ queryKey: ['allUsers'], queryFn: fetchUsers, enabled: !searchNickName });

  /** 검색창 입력 시 검색어에 맞는 유저 실시간 렌더링 */
  const fetchSearchedUsers = async ({ queryKey }: QueryFunctionContext<QueryKey>) => {
    try {
      const nick = queryKey[1] as string;
      const collectionRef = collection(db, 'users');
      const querySnapShot = (await getDocs(collectionRef)).docs;
      const searched: IUser[] = [];
      querySnapShot.forEach((user) => {
        const userData = user.data() as IUser;
        if (userData.nickName.includes(nick)) {
          searched.push(userData);
        }
      });
      return searched;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: searchedUsers } = useQuery({
    queryKey: ['searchedUser', searchNickName],
    queryFn: fetchSearchedUsers,
    enabled: !!searchNickName, // searchNickName이 입력되어 있을 때만 활성화 한다.
  });

  const usersToShow = searchNickName ? searchedUsers : users;

  // 내 정보에 대한 DB를 받아오고 내가 팔로우 하는 사람들의 정보로 follow하고 있는지 객체를 만든다.
  useEffect(() => {
    const getFollowing = async () => {
      const myDBRef = doc(db, 'users', userUid as string);
      const myDoc = await getDoc(myDBRef);
      const myFollowing = myDoc.get('following');
      console.log('내 following 목록 ', myFollowing);
      const followingObj: IFollowingObj = {};
      users?.forEach((user) => {
        if (myFollowing.includes(user.uid)) {
          followingObj[user.uid] = true;
        } else {
          followingObj[user.uid] = false;
        }
      });
      setFollowing(followingObj);
    };
    getFollowing();
  }, [users]);

  /** 해당 유저를 팔로우 하는 함수 */
  const onFollowHandler = async (targetUid: string) => {
    // 팔로우 여부를 변경하고
    setFollowing((prev) => ({
      ...prev,
      [targetUid]: !following?.[targetUid],
    }));

    // 내 following과 target의 follower에 서로의 uid 추가
    const myDocRef = doc(db, 'users', userUid as string);
    await updateDoc(myDocRef, { following: arrayUnion(targetUid) });

    const targetDocRef = doc(db, 'users', targetUid);
    await updateDoc(targetDocRef, { follower: arrayUnion(userUid) });
  };

  /** 해당 유저를 언팔로우 하는 함수 */
  const onUnFollowHandler = async (targetUid: string) => {
    // 팔로우 여부를 변경하고
    setFollowing((prev) => ({
      ...prev,
      [targetUid]: !following?.[targetUid],
    }));

    // 내 following과 target의 follower에 서로의 uid 삭제
    const myDocRef = doc(db, 'users', userUid as string);
    await updateDoc(myDocRef, { following: arrayRemove(targetUid) });

    const targetDocRef = doc(db, 'users', targetUid);
    await updateDoc(targetDocRef, { follower: arrayRemove(userUid) });
  };

  useEffect(() => {
    console.log(following);
  }, [following]);

  return (
    <PageWrap>
      <ContentWrap>
        <div className="flex">
          <Input type="text" placeholder="검색할 유저 ID" value={searchNickName} onChange={onChangeSearchNickName} />
        </div>
        <div>
          {usersToShow &&
            usersToShow.map((user, idx) => {
              return (
                <UserCardWrap key={`search-user-${idx}`}>
                  <Link to={`/search-user/${user.uid}`}>
                    <Avatar className="w-24 h-24">
                      <AvatarInCard avatarImageSrc={user.profileImage} />
                    </Avatar>
                  </Link>
                  <div>
                    <div>닉네임 : {user.nickName}</div>
                    <div>소개말 : {user.introduction}</div>
                    <div>팔로워 : {user.follower.length}</div>
                    <div>팔로잉 : {user.following.length}</div>
                  </div>
                  <div className="absolute right-3 top-3">
                    {following?.[user.uid] ? (
                      <div onClick={() => onUnFollowHandler(user.uid)}>언팔로우</div>
                    ) : (
                      <div onClick={() => onFollowHandler(user.uid)}>팔로우</div>
                    )}
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
