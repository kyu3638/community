import { Navigate, Outlet } from 'react-router-dom';
import { useUserUid } from '@/contexts/LoginUserState';
import { useEffect } from 'react';

const ProtectedRoute = () => {
  const { isLogin } = useUserUid();
  useEffect(() => {
    if (isLogin) {
      console.log(`로그인 되어 있어 해당 페이지로 이동합니다.`);
    } else {
      console.log(`로그인 상태가 아니어서 로그인 페이지로 이동합니다.`);
    }
  });
  return isLogin ? <Outlet /> : <Navigate to={'/login'} />;
};

export default ProtectedRoute;
