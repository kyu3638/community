import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserUid } from '@/contexts/LoginUserState';

const ProtectedRoute = () => {
  const { isLogin } = useUserUid();
  const currentLocation = useLocation();
  console.log(currentLocation);

  return isLogin ? <Outlet /> : <Navigate to={'/login'} replace state={{ redirectedFrom: currentLocation }} />;
};

export default ProtectedRoute;
