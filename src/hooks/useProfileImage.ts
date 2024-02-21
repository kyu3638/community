import { uploadProfileImage } from '@/apis/user/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import unknownImage from '/unknown.png';

export const useProfileImage = (uid: string) => {
  const [profileImageTempURL, setProfileImageTempURL] = useState(unknownImage);
  const [profileImageURL, setProfileImageURL] = useState('');

  const queryClient = useQueryClient();
  const imageUploadMutation = useMutation({
    mutationFn: uploadProfileImage,
    onMutate: (data) => {
      queryClient.cancelQueries({ queryKey: ['user', uid] });
      const previdousData = queryClient.getQueryData(['user', uid]);
      console.log(previdousData);
      queryClient.setQueryData(['user', uid], (prev) => {
        console.log(`prev`, prev);
        // const tempURL = URL.createObjectURL(data.file);
        // return { ...prev, profileImage: tempURL };
      });
      return previdousData;
    },
    onSettled: () => {
      //   queryClient.invalidateQueries({ queryKey: ['user', uid] });
    },
  });
  return { profileImageURL, setProfileImageURL, profileImageTempURL, setProfileImageTempURL, imageUploadMutation };
};
