import { followHandler } from '@/apis/user/users';
import { IUser } from '@/types/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useFollow = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: followHandler,
    onMutate: async ({ userUid, targetUid }: { userUid: string; targetUid: string }) => {
      console.log(`onMutate 시작`);
      await queryClient.cancelQueries({ queryKey: ['users', searchKeyword] });
      await queryClient.cancelQueries({ queryKey: ['user', userUid] });
      await queryClient.cancelQueries({ queryKey: ['follower', targetUid] });
      await queryClient.cancelQueries({ queryKey: ['following', targetUid] });
      const previousSearchData = queryClient.getQueryData(['users', searchKeyword]);
      const previousUserData = queryClient.getQueryData(['user', userUid]);
      const previousFollowerData = queryClient.getQueryData(['follower', targetUid]);
      const previousFollowingData = queryClient.getQueryData(['following', targetUid]);

      if (previousSearchData) {
        queryClient.setQueryData(
          ['users', searchKeyword],
          (prevUsers: { pageParams: IUser | null; pages: { querySnapshot: IUser[]; lastDoc: IUser }[] }) => {
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
          }
        );
      }
      // 내 팔로우 목록에서 추가 또는 삭제
      if (previousUserData) {
        queryClient.setQueryData(['user', userUid], (prevUser: IUser) => {
          if (prevUser.following.includes(targetUid)) {
            const removed = prevUser.following.filter((uid: string) => uid !== userUid);
            return { ...prevUser, following: removed };
          } else {
            const added = [...prevUser.following, targetUid];
            return { ...prevUser, following: added };
          }
        });
      }
      if (previousFollowerData) {
        queryClient.setQueryData(['follower', targetUid], (prevTarget: IUser) => {
          if (prevTarget.follower.includes(userUid)) {
            // console.log(`언팔할 때`);
            // console.log(`userUid`, userUid);
            // console.log(`prevTarget.follower`, prevTarget.follower);
            const removed = prevTarget.follower.filter((uid) => uid !== userUid);
            // console.log(`제거된  follower`, removed);
            return { ...prevTarget, follower: removed };
          } else {
            // console.log(`팔로우할 때`);
            // console.log(`prevTarget.follower`, prevTarget.follower);
            const added = [...prevTarget.follower, userUid];
            // console.log(`추가된  follower`, added);
            return { ...prevTarget, follower: added };
          }
        });
      }
      if (previousFollowingData) {
        queryClient.setQueryData(['following', targetUid], (prev) => {
          console.log(`prev`, prev);
        });
      }

      return { previousSearchData, previousUserData };
    },
    onError: (error, variables, context) => {
      console.log(error);
      const userUid = variables.userUid;
      queryClient.setQueryData(['users', searchKeyword], context?.previousSearchData);
      queryClient.setQueryData(['user', userUid], context?.previousUserData);
    },
    onSettled: (__data, __error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', searchKeyword] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userUid] });
      // 나의 팔로잉,팔로우 정보 뿐만 아니라 target 유저의 정보도 갱신이 필요
      // (following은 목록에서 사라지기 때문에 무효화 해줄 필요 없지만, follower는 목록에 남기 때문에 ['follower', variables.targetUid] 쿼리키에 대해 무효화 필요)
      queryClient.invalidateQueries({ queryKey: ['follower', variables.targetUid] });
      queryClient.invalidateQueries({ queryKey: ['following', variables.targetUid] });
    },
  });

  return { searchKeyword, setSearchKeyword, mutate };
};
