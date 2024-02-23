import { db } from '@/firebase/firebase';
import {
  collection,
  orderBy,
  query,
  startAfter,
  limit,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';

export const fetchUser = async ({ queryKey }: { queryKey: string[] }) => {
  try {
    const userUid = queryKey[1];
    const userRef = doc(db, 'users', userUid);
    const docSnapshot = await getDoc(userRef);
    return docSnapshot.data();
  } catch (error) {
    console.log(error);
  }
};

export const fetchUsers = async ({
  queryKey,
  pageParam,
}: {
  queryKey: string[];
  pageParam: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}) => {
  try {
    const keyword = queryKey[1];
    // 검색 키워드가 있는 경우와 없는 경우 구분
    if (!keyword) {
      const usersRef = collection(db, 'users');
      let q;
      if (pageParam) {
        q = query(usersRef, orderBy('createdAt'), startAfter(pageParam), limit(5));
      } else {
        q = query(usersRef, orderBy('createdAt'), limit(5));
      }

      const result = (await getDocs(q)).docs;
      const querySnapshot = result.map((doc) => doc.data());
      const lastDoc = result[result.length - 1];
      return { querySnapshot, lastDoc };
    } else {
      const usersRef = collection(db, 'users');
      const querySnapshot = (await getDocs(usersRef)).docs
        .map((doc) => doc.data())
        .filter((userData) => userData.nickName.includes(keyword));

      return { querySnapshot, lastDoc: null };
    }
  } catch (error) {
    console.log(error);
  }
};

export const followHandler = async ({
  userUid,
  targetUid,
  type,
}: {
  userUid: string;
  targetUid: string;
  type: string;
}) => {
  try {
    const command = type === 'addFollowing' ? arrayUnion : arrayRemove;

    const myDocRef = doc(db, 'users', userUid!);
    await updateDoc(myDocRef, { following: command(targetUid) });

    const targetDocRef = doc(db, 'users', targetUid);
    await updateDoc(targetDocRef, { follower: command(userUid) });
  } catch (error) {
    console.log(error);
  }
};

export const fetchFollowing = async (uid: string) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnapshot = await getDoc(userDocRef);
    return docSnapshot.data();
  } catch (error) {
    console.log(error);
  }
};
