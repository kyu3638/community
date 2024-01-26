import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import SignUpStepOne from '@/pages/SignUpStepOne';
import SignUpStepTwo from '@/pages/SignUpStepTwo';
import MyPage from './pages/MyPage';
import ProtectedRoute from './Routes/ProtectedRoute/ProtectedRoute';
// import NavBar from './layout/NavBar';

function App() {
  return (
    <>
      <BrowserRouter>
        {/* <NavBar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up-step-one" element={<SignUpStepOne />} />
          <Route path="/sign-up-step-two" element={<SignUpStepTwo />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
