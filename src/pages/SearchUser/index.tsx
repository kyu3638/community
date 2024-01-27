import ContentWrap from '@/components/Wrap/ContentWrap';
import PageWrap from '@/components/Wrap/PageWrap';
import UserCardWrap from '@/components/Wrap/UserCardWrap';
import { db } from '@/firebase/firebase';
import { IUser } from '@/types/common';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const SearchUser = () => {
  const [users, setUsers] = useState<IUser[] | undefined>();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const usersArr: IUser[] = [];
        querySnapshot.forEach((user) => {
          const userData = JSON.stringify(user.data());
          usersArr.push(JSON.parse(userData));
        });
        if (usersArr) {
          setUsers(usersArr);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUsers();
  }, []);
  return (
    <PageWrap>
      <ContentWrap>
        <div>
          {users &&
            users.map((user) => {
              return (
                <UserCardWrap>
                  <img className="w-12" src={`${user.profileImage}`} />
                  <div>
                    <span>닉네임 : </span>
                    {user.nickName}
                  </div>
                  <div>
                    <span>유저 인사말 : </span>
                    {user.introduction}
                  </div>
                </UserCardWrap>
              );
            })}
        </div>
      </ContentWrap>
    </PageWrap>
  );
};

export default SearchUser;
