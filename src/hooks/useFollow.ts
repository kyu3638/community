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

      if (previousData) {
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
      }
      //

      return previousData;
    },
    onError: (error, __variables, context) => {
      console.log(error);
      queryClient.setQueryData(['users', searchKeyword], context?.previousData);
    },
    onSettled: (__data, __error, variables) => {
      console.log(variables);
      queryClient.invalidateQueries({ queryKey: ['users', searchKeyword] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userUid] });
      // 나의 팔로잉,팔로우 정보 뿐만 아니라 target 유저의 정보도 갱신이 필요
      // (following은 목록에서 사라지기 때문에 무효화 해줄 필요 없지만, follower는 목록에 남기 때문에 ['follower', variables.targetUid] 쿼리키에 대해 무효화 필요)
      queryClient.invalidateQueries({ queryKey: ['follower', variables.targetUid] });
    },
  });

  return { searchKeyword, setSearchKeyword, mutate };
};
