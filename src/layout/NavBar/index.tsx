import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserUid } from '@/contexts/LoginUserState';
import { auth } from '@/firebase/firebase';
import logoImage from '/logo.png';
import { useCallback } from 'react';

const NavBar = () => {
  const { isLogin, userUid, updateUserUid } = useUserUid();
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPage = useCallback(
    (pageName?: string) => {
      if (pageName === location.pathname.split('/').filter((v) => v !== '')[0]) {
        return 'font-bold';
      }
      return '';
    },
    [location]
  );

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
    <nav className="w-full h-nav-bar-height flex items-center justify-around px-5 border-b-2 bg-[#edf3fd]">
      <div className="flex justify-start flex-grow items-center">
        <Link to={'/'}>
          <img className="w-[50px] h-[50px]" src={logoImage} />
        </Link>
        <h1 className="text-2xl">코드숲 - Test</h1>
      </div>
      <div className="flex-grow flex justify-center gap-5">
        <Link className={`${isCurrentPage(undefined)}`} to={'/'}>
          뉴스피드
        </Link>
        <Link className={`${isCurrentPage('search-user')}`} to={'/search-user'} onClick={onClickReload}>
          유저 찾기
        </Link>
        <Link className={`${isCurrentPage('user')}`} to={`/user/${userUid}`}>
          마이페이지
        </Link>
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
