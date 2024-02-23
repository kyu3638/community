import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Routes/ProtectedRoute/ProtectedRoute';
import { useEffect } from 'react';
import { useUserUid } from './contexts/LoginUserState';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// import NavBar from './layout/NavBar';
// import GlobalStyle from './GlobalStyles';
// import Login from './pages/Login';
// import SignUpStepOne from './pages/SignUpStepOne';
// import SignUpStepTwo from './pages/SignUpStepTwo';
// import Newsfeed from './pages/NewsFeed';
// import Article from './pages/Article';
// import Posting from './pages/Posting';
// import MyPage from './pages/MyPage';
// import SearchUser from './pages/SearchUser';

import { lazy, Suspense } from 'react';

const NavBar = lazy(() => import('@/layout/NavBar'));
const Login = lazy(() => import('@/pages/Login'));
const SignUpStepOne = lazy(() => import('@/pages/SignUpStepOne'));
const SignUpStepTwo = lazy(() => import('@/pages/SignUpStepTwo'));
const MyPage = lazy(() => import('@/pages/MyPage'));
const Posting = lazy(() => import('@/pages/Posting'));
const Article = lazy(() => import('@/pages/Article'));
const Newsfeed = lazy(() => import('@/pages/NewsFeed'));
const SearchUser = lazy(() => import('@/pages/SearchUser'));
const GlobalStyle = lazy(() => import('@/GlobalStyles'));

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
        <Suspense fallback={<div>Loading...</div>}>
          <QueryClientProvider client={queryClient}>
            <GlobalStyle />
            <NavBar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/sign-up-step-one" element={<SignUpStepOne />} />
              <Route path="/sign-up-step-two" element={<SignUpStepTwo />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Newsfeed />} />
                <Route path="/article/:articleId" element={<Article />} />
                <Route path="/posting" element={<Posting />} />
                <Route path="/user/:userUid" element={<MyPage />} />
                <Route path="/search-user" element={<SearchUser />} />
              </Route>
            </Routes>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
