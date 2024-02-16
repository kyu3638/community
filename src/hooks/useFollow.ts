import { followHandler } from '@/apis/user/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useFollow = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
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

  return { searchKeyword, setSearchKeyword, mutate };
};
