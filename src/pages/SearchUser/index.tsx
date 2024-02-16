import AvatarInCard from '@/components/Avatar/AvatarInCard';
import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import UserCardWrap from '@/components/Wrap/UserCardWrap';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useUserUid } from '@/contexts/LoginUserState';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { fetchUsers, followHandler } from '@/apis/user/users';
import { Button } from '@/components/ui/button';
import { CgSearch } from 'react-icons/cg';

const SearchUser = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const { userUid } = useUserUid();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const {
    data: users,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['users', searchKeyword],
    queryFn: fetchUsers,
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage?.lastDoc ? lastPage?.lastDoc : null;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  const usersToShow = users?.pages.map((q) => q?.querySnapshot).flat();

  // 팔로우, 언팔로우 하는 로직

  const { mutate: editFollow } = useMutation({
    mutationFn: followHandler,
    onMutate: async ({ userUid, targetUid }) => {
      console.log(`onMutate 시작`);
      await queryClient.cancelQueries({ queryKey: ['users', searchKeyword] });
      const previousData = queryClient.getQueryData(['users', searchKeyword]);

      queryClient.setQueryData(['users', searchKeyword], (prevUsers) => {
        const newPages = prevUsers.pages.map((docs) => {
          const newQuerySnapshot = docs.querySnapshot.map((user) => {
            if (user.uid === targetUid) {
              if (user.follower.includes(userUid)) {
                const removed = user.follower.filter((uid: string) => uid !== userUid);
                return { ...user, follower: removed };
              } else {
                const added = [...user.follower, userUid];
                return { ...user, follower: added };
              }
            }
            if (user.uid === userUid) {
              if (user.following.includes(targetUid)) {
                const removed = user.following.filter((uid: string) => uid !== targetUid);
                return { ...user, following: removed };
              } else {
                const added = [...user.following, targetUid];
                return { ...user, following: added };
              }
            }
            return { ...user };
          });
          return { ...docs, querySnapshot: newQuerySnapshot };
        });
        return { pageParams: prevUsers.pageParams, pages: newPages };
      });

      return previousData;
    },
    onError: (error, __variables, context) => {
      console.log(error);
      queryClient.setQueryData(['users', searchKeyword], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users', searchKeyword] });
    },
  });

  return (
    <div>
      <PageWrap>
        <ContentWrap>
          <div className="flex items-center gap-5">
            <CgSearch size={35} />
            <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
          </div>
          <div>
            {usersToShow?.map((user, index) => {
              const isMyProfile = user?.uid === userUid;
              return (
                <UserCardWrap key={`search-user-${index}`}>
                  <Link to={`/search-user/${user?.uid}`}>
                    <AvatarInCard avatarImageSrc={user?.profileImage} />
                  </Link>
                  <div>
                    <div>닉네임 : {user?.nickName}</div>
                    <div>팔로워 : {user?.follower.length}</div>
                    <div>팔로잉 : {user?.following.length}</div>
                    <div>소개말 : {user?.introduction}</div>
                  </div>
                  <div className="absolute right-3 top-3">
                    {!isMyProfile && (
                      <>
                        {user?.follower.includes(userUid) ? (
                          <Button
                            variant={'unfollow'}
                            size={'xs'}
                            onClick={() => editFollow({ userUid, targetUid: user?.uid, type: 'removeFollowing' })}
                          >
                            ✓팔로잉
                          </Button>
                        ) : (
                          <Button
                            variant={'follow'}
                            size={'xs'}
                            onClick={() => editFollow({ userUid, targetUid: user?.uid, type: 'addFollowing' })}
                          >
                            팔로우
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </UserCardWrap>
              );
            })}
          </div>
        </ContentWrap>
      </PageWrap>
      <div ref={ref}>{isFetchingNextPage && <h3>Loading....</h3>}</div>
    </div>
  );
};
export default SearchUser;
