import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { fetchUsers } from '@/apis/user/users';
// import { CgSearch } from '@react-icons/all-files/cg/CgSearch';
import { FaUser } from '@react-icons/all-files/fa/FaUser';
import UserCard from './UserCard';
import { useFollow } from '@/hooks/useFollow';
import { IUser } from '@/types/common';

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
    <div>
      <PageWrap>
        <ContentWrap>
          <div className="flex items-center gap-5">
            <FaUser size={35} /> 임시
            <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
          </div>
          <div>
            {usersToShow?.map((user, index) => {
              return <UserCard key={`search-user-${index}`} user={user as IUser} editFollow={editFollow} />;
            })}
          </div>
        </ContentWrap>
      </PageWrap>
      <div ref={ref}>{isFetchingNextPage && <h3>Loading....</h3>}</div>
    </div>
  );
};
export default SearchUser;
