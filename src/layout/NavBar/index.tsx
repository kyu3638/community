import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';
import { auth } from '@/firebase/firebase';

const NavBar = () => {
  const { isLogin, updateUserUid } = useUserUid();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      updateUserUid(null);
    } catch (err) {
      console.log(err);
    }
  };

  /** 네비게이션 "유저 찾기"를 누를 경우 무조건 새로고침 */
  const onClickReload = () => {
    if (location.pathname === '/search-user') {
      navigate(0);
    }
  };

  return (
    <nav className="w-full h-24  flex items-center justify-between px-5">
      <Link to={'/'}>로고</Link>
      <div className="flex gap-4">
        <Link to={'/newsfeed'}>뉴스피드</Link>
        <Link to={'/search-user'} onClick={onClickReload}>
          유저 찾기
        </Link>
        <Link to={'/mypage'}>MyPage</Link>
      </div>
      <div>
        <Button asChild variant="outline">
          <Link to={'/posting'}>글 작성</Link>
        </Button>
        {isLogin ? (
          <Button onClick={handleLogout} variant="outline">
            로그아웃
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to={'/login'}>로그인</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
