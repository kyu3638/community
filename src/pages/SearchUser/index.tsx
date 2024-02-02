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
import { QueryFunctionContext, QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface IFollowingObj {
  [userUid: string]: boolean;
}

interface IFollowingFuncArg {
  targetUid: string;
  command: typeof arrayUnion | typeof arrayRemove;
}

const SearchUser = () => {
  const [searchNickName, setSearchNickName] = useState<string>('');

  const queryClient = useQueryClient();

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
  const { data: users } = useQuery({
    queryKey: ['allUsers'],
    queryFn: fetchUsers,
    staleTime: 5 * 1000,
    enabled: !searchNickName,
  });

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
    staleTime: 5 * 1000,
    enabled: !!searchNickName, // searchNickName이 입력되어 있을 때만 활성화 한다.
  });

  // 카드로 렌더링 될 유저들
  const usersToShow = searchNickName ? searchedUsers : users;

  const fetchFollowing = async () => {
    try {
      const myDocRef = doc(db, 'users', userUid as string);
      const myDoc = await getDoc(myDocRef);
      const myFollowing = myDoc.get('following');
      console.log(`usersToShow`, usersToShow);
      console.log(`myFollowing`, myFollowing);
      const followingObj: IFollowingObj = {};
      usersToShow?.forEach((user) => {
        if (myFollowing.includes(user.uid)) {
          followingObj[user.uid] = true;
        } else {
          followingObj[user.uid] = false;
        }
      });
      console.log(followingObj);
      return followingObj;
    } catch (error) {
      console.log(error);
    }
  };
  const { data: following } = useQuery({
    queryKey: ['following'],
    queryFn: fetchFollowing,
    staleTime: 5 * 1000,
    enabled: !!usersToShow,
  });

  /** 해당 유저를 팔로우 하는 함수 */
  // const onFollowHandler = async (targetUid: string) => {
  //   // 팔로우 여부를 변경하고
  //   // setFollowing((prev) => ({
  //   //   ...prev,
  //   //   [targetUid]: !following?.[targetUid],
  //   // }));

  //   // 내 following과 target의 follower에 서로의 uid 추가
  //   const myDocRef = doc(db, 'users', userUid as string);
  //   await updateDoc(myDocRef, { following: arrayUnion(targetUid) });

  //   const targetDocRef = doc(db, 'users', targetUid);
  //   await updateDoc(targetDocRef, { follower: arrayUnion(userUid) });
  // };

  const followHandler = async ({ targetUid, command }: IFollowingFuncArg): Promise<void> => {
    const myDocRef = doc(db, 'users', userUid as string);
    await updateDoc(myDocRef, { following: command(targetUid) });

    const targetDocRef = doc(db, 'users', targetUid);
    await updateDoc(targetDocRef, { follower: command(userUid) });
  };
  const { mutate: editFollowing } = useMutation({
    mutationFn: followHandler,
    // onSuccess: (_, varibales) => {
    //   // 이전 쿼리를 무효화해 다시 쿼리를 불러오도록 강제함(POST와 GET 액션 수행)
    //   queryClient.invalidateQueries({ queryKey: ['following'] });
    //   // DB에서 following을 수정하는 POST 액션이 성공하면 following쿼리를 아래와 같이 변경해준다.(GET 액션 방지)
    //   // queryClient.setQueryData(['following'], (prevFollowing: IFollowingObj) => {
    //   //   console.log(prevFollowing);
    //   //   return {
    //   //     ...prevFollowing,
    //   //     [varibales]: !prevFollowing[varibales],
    //   //   };
    //   // });
    // },
    onMutate: async ({ targetUid }) => {
      // following 쿼리를 취소
      await queryClient.cancelQueries({ queryKey: ['following'] });
      // 이전 following 상태를 저장해두고
      const previousFollowing = queryClient.getQueryData(['following']);
      // 성공 시 진행되어야 하는 형태로 바꿔준다.
      queryClient.setQueryData(['following'], (oldFollowing: IFollowingObj) => {
        return { ...oldFollowing, [targetUid]: !oldFollowing[targetUid] };
      });
      // 이전 following 상태를 반환하여 오류 발생 시 이전 상태로 following 쿼리를 만든다.
      return {
        previousFollowing,
      };
    },
    // 이전 following 상태를 받아 following 쿼리를 만든다.
    onError: (_error, _product, context) => {
      queryClient.setQueryData(['following'], context?.previousFollowing);
    },
    // 성공하든 실패하든 following 쿼리를 다시 불러온다
    // 성공 시 optimistic updates로 이미 화면에는 db와 같은 내용이 출력되어 있을 것이다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });

  useEffect(() => {
    console.log(following);
  }, [usersToShow, following]);

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
                      <div onClick={() => editFollowing({ targetUid: user.uid, command: arrayRemove })}>언팔로우</div>
                    ) : (
                      // <div onClick={() => onFollowHandler(user.uid)}>팔로우</div>
                      <div onClick={() => editFollowing({ targetUid: user.uid, command: arrayUnion })}>팔로우</div>
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
