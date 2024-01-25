import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const mypp = () => {
    navigate('/mypage');
  };
  return (
    <div>
      Home<button onClick={mypp}>mypage</button>
    </div>
  );
};

export default Home;
