import { Helmet } from 'react-helmet-async';

interface IProps {
  title: string;
  desc: string;
}

const Metadatas = ({ title, desc }: IProps) => {
  return (
    <Helmet>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <title>{`코드숲 | ${title}`}</title>
    </Helmet>
  );
};

export default Metadatas;
