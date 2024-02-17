import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';
import { auth } from '@/firebase/firebase';
import logoImage from '/logo.png';

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
    <nav className="w-full h-24 flex items-center justify-around px-5 border-b">
      <div className="flex justify-start flex-grow">
        <Link to={'/'}>
          <img className="w-[50px] h-[50px]" src={logoImage} />
        </Link>
      </div>
      <div className="flex-grow flex justify-center gap-5">
        <Link to={'/'}>뉴스피드</Link>
        <Link to={'/search-user'} onClick={onClickReload}>
          유저 찾기
        </Link>
        <Link to={'/mypage'}>마이페이지</Link>
      </div>
      <div className="flex-grow flex justify-end gap-5">
        {isLogin ? (
          <>
            <Button asChild variant="outline">
              <Link to={'/posting'} state={{ mode: 'create' }}>
                글 작성
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="outline">
              로그아웃
            </Button>
          </>
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
