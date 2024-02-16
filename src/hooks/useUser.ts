import { fetchUser } from '@/apis/user/users';
import { useQuery } from '@tanstack/react-query';

export const useUser = (userUid: string) => {
  const { data } = useQuery({
    queryKey: ['user', userUid],
    queryFn: fetchUser,
  });
  return { data };
};
