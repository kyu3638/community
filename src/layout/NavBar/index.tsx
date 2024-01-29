import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';
import { auth } from '@/firebase/firebase';

const NavBar = () => {
  const { isLogin, updateUserUid } = useUserUid();

  const handleLogout = async () => {
    try {
      await auth.signOut().then(() => {
        updateUserUid(null);
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <nav className="w-full h-24  flex items-center justify-between px-5">
      <Link to={'/'}>로고</Link>
      <div className="flex gap-4">
        <Link to={'/search-user'}>유저 찾기</Link>
        <Link to={'/mypage'}>MyPage</Link>
      </div>
      {isLogin ? (
        <Button onClick={handleLogout} variant="outline">
          로그아웃
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link to={'/login'}>로그인</Link>
        </Button>
      )}
    </nav>
  );
};

export default NavBar;
