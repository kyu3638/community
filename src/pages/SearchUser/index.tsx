import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import UserCardWrap from '@/components/Wrap/UserCardWrap';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import {
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useUserUid } from '@/contexts/LoginUserState';
import {
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';

interface IFollowingObj {
  [userUid: string]: boolean;
}

interface IFollowingFuncArg {
  targetUid: string;
  type: string;
}

interface IUsersArr {
  users: string[] | undefined | null;
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
    enabled: !!searchNickName, // searchNickName이 입력되어 있을 때만 활성화 한다.
  });

  // 카드로 렌더링 될 유저들
  const usersToShow = searchNickName ? searchedUsers : users;

  const fetchFollowing = async ({ queryKey }: QueryFunctionContext<QueryKey>) => {
    try {
      const arg = queryKey[1] as IUsersArr;
      const users = arg.users;
      const myDocRef = doc(db, 'users', userUid as string);
      const myDoc = await getDoc(myDocRef);
      const myFollowing = myDoc.get('following');
      const followingObj: IFollowingObj = {};
      users?.forEach((uid) => {
        if (myFollowing.includes(uid)) {
          followingObj[uid] = true;
        } else {
          followingObj[uid] = false;
        }
      });
      return followingObj;
    } catch (error) {
      console.log(error);
    }
  };

  const { data: following } = useQuery({
    queryKey: ['following', { users: usersToShow?.map((user) => user.uid) }],
    queryFn: fetchFollowing,
  });

  const followHandler = async ({ targetUid, type }: IFollowingFuncArg): Promise<void> => {
    try {
      const command = type === 'addFollowing' ? arrayUnion : arrayRemove;

      const myDocRef = doc(db, 'users', userUid as string);
      await updateDoc(myDocRef, { following: command(targetUid) });

      const targetDocRef = doc(db, 'users', targetUid);
      await updateDoc(targetDocRef, { follower: command(userUid) });
    } catch (error) {
      console.log(error);
    }
  };

  const { mutate: editFollowing } = useMutation({
    mutationFn: followHandler,
    onMutate: async ({ targetUid }) => {
      // following 쿼리를 취소
      await queryClient.cancelQueries({ queryKey: ['following', { users: usersToShow?.map((user) => user.uid) }] });
      // 이전 following 상태를 저장해두고
      const previousFollowing = queryClient.getQueryData([
        'following',
        { users: usersToShow?.map((user) => user.uid) },
      ]);
      // 성공 시 진행되어야 하는 형태로 바꿔준다.
      queryClient.setQueryData(
        ['following', { users: usersToShow?.map((user) => user.uid) }],
        (oldFollowing: IFollowingObj) => {
          return { ...oldFollowing, [targetUid]: !oldFollowing[targetUid] };
        }
      );
      // 이전 following 상태를 반환하여 오류 발생 시 이전 상태로 following 쿼리를 만든다.
      return {
        previousFollowing,
      };
    },
    // 이전 following 상태를 받아 following 쿼리를 만든다.
    onError: (error, _product, context) => {
      console.log(`error`, error);
      queryClient.setQueryData(['following'], context?.previousFollowing);
    },
    // 성공하든 실패하든 following 쿼리를 다시 불러온다
    // 성공 시 optimistic updates로 이미 화면에는 db와 같은 내용이 출력되어 있을 것이다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['searchedUser'] });
    },
  });

  const { ref, inView } = useInView();
  const fetchUserss = async (props) => {
    console.log(`fetchUserss가 받는 props`, props);
    console.log(`fetchUserss가 받는 props.pageParam`, props.pageParam);

    const usersRef = collection(db, 'users');
    let q;
    if (!props.pageParam) {
      q = query(usersRef, orderBy('createdAt', 'asc'), limit(3));
    } else {
      q = query(usersRef, orderBy('createdAt', 'asc'), startAfter(props.pageParam), limit(3));
    }
    const querySnapshot: QuerySnapshot = await getDocs(q);
    const usersDocs: DocumentData[] = querySnapshot.docs;

    return usersDocs;
  };
  const {
    data: userss,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['userss'],
    queryFn: fetchUserss,
    initialPageParam: null,
    getNextPageParam: (lastPage, allpages, lastPageparam, allpagesParam) => {
      console.log(`getNextPageParam의 인자 lastPage`, lastPage);
      console.log(`getNextPageParam의 인자 allpages`, allpages);
      console.log(`getNextPageParam의 인자 lastPageparam`, lastPageparam);
      console.log(`getNextPageParam의 인자 allpagesParam`, allpagesParam);
      const lastDoc = lastPage[lastPage.length - 1]; // 마지막 페이지의 마지막 doc 이후의 자료들만 가져올 수 있도록 pageParam을 넘겨줌
      return lastDoc;
    },
  });

  useEffect(() => {
    console.log(`✅useInfiniteQuery의 반환 data:userss`, userss);
  }, [userss]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <PageWrap>
      <ContentWrap>
        <div className="flex">
          <Input type="text" placeholder="검색할 유저 ID" value={searchNickName} onChange={onChangeSearchNickName} />
        </div>
        <div>
          {userss &&
            userss.pages.map((page) =>
              page.map((doc, index) => {
                const userid = doc.id;
                const userInfo = doc.data();
                return (
                  <div className="mb-[500px]" key={index}>
                    <span>{userid}</span>
                    {userInfo.nickName}
                  </div>
                );
              })
            )}
          <div ref={ref}>
            {isFetchingNextPage && <div>Loading...</div>}
            <Button onClick={() => fetchNextPage()}>더 불러오기</Button>
          </div>
          {/* usersToShow &&
            usersToShow.map((user, idx) => {
              return (
                <UserCardWrap key={`search-user-${idx}`}>
                  <Link to={`/search-user/${user.uid}`}>
                    <AvatarInCard avatarImageSrc={user.profileImage} />
                  </Link>
                  <div>
                    <div>닉네임 : {user.nickName}</div>
                    <div>소개말 : {user.introduction}</div>
                    <div>팔로워 : {user.follower.length}</div>
                    <div>팔로잉 : {user.following.length}</div>
                  </div>
                  <div className="absolute right-3 top-3">
                    {following?.[user.uid] ? (
                      <div onClick={() => editFollowing({ targetUid: user.uid, type: 'removeFollowing' })}>
                        언팔로우
                      </div>
                    ) : (
                      <div onClick={() => editFollowing({ targetUid: user.uid, type: 'addFollowing' })}>팔로우</div>
                    )}
                  </div>
                </UserCardWrap>
              );
            }) */}
        </div>
      </ContentWrap>
    </PageWrap>
  );
};

export default SearchUser;
