import { fetchUser } from '@/apis/user/users';
import { useQuery } from '@tanstack/react-query';

export const useUser = (userUid: string) => {
  return useQuery({
    queryKey: ['user', userUid],
    queryFn: fetchUser,
    staleTime: 1 * 60 * 1000,
  });
};
