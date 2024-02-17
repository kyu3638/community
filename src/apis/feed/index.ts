import { db } from '@/firebase/firebase';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';

export interface IArticle {
  articleId: string;
  uid: string;
  nickName: string;
  title: string;
  content: string;
  images: string[];
  like: string[];
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export const fetchUsersArticles = async ({ queryKey }: { queryKey: string[] }) => {
  try {
    const uid = queryKey[1];
    const collectionRef = collection(db, `feeds`);
    const q = query(collectionRef, where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const querySnapshot = (await getDocs(q)).docs;
    const articleWithId = querySnapshot.map((doc) => {
      const id = doc.id;
      const data = doc.data();
      return { ...data, articleId: id };
    });
    return articleWithId as IArticle[];
  } catch (error) {
    console.log(error);
  }
};

export const onRemoveArticle = async ( articleId: string) => {
  try {
    console.log(isUser);
    const articleRef = doc(db, 'feeds', articleId as string);
    await deleteDoc(articleRef);
    console.log(`articleId : ${articleId}에 해당하는 게시글이 삭제 되었습니다.`);
  } catch (error) {
    console.log(error);
  }
};
