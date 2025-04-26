import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { logo } from '../assets/images/characterPath';

// Página inicial
const Home = () => {
  const navigate = useNavigate(); // Hook para navegação entre páginas

  return (
    <Container className='d-flex align-items-center justify-content-center vh-100 text-light'>
      <Row className='w-100'>
        <Col md={ 6 } className='d-flex justify-content-center align-items-center'>
          {/* Logo do aplicativo */}
          <Image 
            alt='logo' 
            className='img-fluid shadow-lg logo' 
            src={ logo } 
            style={{ maxWidth: '350px' }} 
          />
        </Col>
        <Col className='d-flex flex-column justify-content-center align-items-center' md={ 6 }>
            {/* Título da página */}
            <h1 className='login-title'>Crie ou entre numa pista para começar</h1>
            {/* Botões de navegação */}
            <Button 
              className='menu-button' 
              onClick={() => navigate('/login')}
              variant='primary' 
            >
              Criar Uma Pista
            </Button>
            <Button 
              className='menu-button' 
              onClick={() => navigate('/enter-track')}
              variant='secondary' 
            >
              Entrar Numa Pista
            </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;