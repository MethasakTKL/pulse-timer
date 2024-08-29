import Timer from './components/Timer';
import { Container } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Timer />
    </Container>
  );
};

export default Home;