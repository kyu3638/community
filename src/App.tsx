import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import SignUpStepOne from '@/pages/SignUpStepOne';
import SignUpStepTwo from '@/pages/SignUpStepTwo';
import MyPage from './pages/MyPage';
import ProtectedRoute from './Routes/ProtectedRoute/ProtectedRoute';
import NavBar from './layout/NavBar';
import { useEffect } from 'react';
import { useUserUid } from './contexts/LoginUserState';
import SearchUser from './pages/SearchUser';
import UserPage from './pages/UserPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const { updateUserUid } = useUserUid();
  /** 로그인 상태에서 접근되면 안되는 페이지들에서 내보내기 */
  useEffect(() => {
    const _session_key = `firebase:authUser:${import.meta.env.VITE_FIREBASE_API_KEY}:[DEFAULT]`;
    const sessionData = sessionStorage.getItem(_session_key);
    if (sessionData) {
      const uid = JSON.parse(sessionData).uid;
      updateUserUid(uid);
    }
  }, []);

  return (
    <div>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up-step-one" element={<SignUpStepOne />} />
            <Route path="/sign-up-step-two" element={<SignUpStepTwo />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/search-user" element={<SearchUser />} />
              <Route path="/search-user/:userUid" element={<UserPage />} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
