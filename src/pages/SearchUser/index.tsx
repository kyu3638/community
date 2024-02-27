import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { fetchUsers } from '@/apis/user/users';
import UserCard from './UserCard';
import { useFollow } from '@/hooks/useFollow';
import { IUser } from '@/types/common';
import { FaSearch } from '@react-icons/all-files/fa/FaSearch';
import Metadatas from '@/metadatas/Metadatas';

const SearchUser = () => {
  const { searchKeyword, setSearchKeyword, mutate: editFollow } = useFollow();
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
      const nextPageStart = lastPage?.lastDoc ? lastPage.lastDoc : null;
      return nextPageStart;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  const usersToShow = users?.pages.map((q) => q?.querySnapshot).flat();

  return (
    <>
      <PageWrap>
        <ContentWrap>
          <Metadatas title={`유저찾기`} desc={`코드숲 유저찾기 페이지입니다.`} />
          <div className="flex items-center gap-3 ml-3 mr-3">
            <FaSearch size={30} />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색할 유저명을 작성해주세요"
            />
          </div>
          <div>
            {usersToShow?.map((user, index) => {
              return <UserCard key={`search-user-${index}`} user={user as IUser} editFollow={editFollow} />;
            })}
          </div>
        </ContentWrap>
      </PageWrap>
      <div ref={ref}>{isFetchingNextPage && <h3>Loading....</h3>}</div>
    </>
  );
};
export default SearchUser;
