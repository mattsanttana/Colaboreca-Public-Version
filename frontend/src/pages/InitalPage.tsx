import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { logo } from '../teste_avatares/characterPath';
import '../styles.css';

const InitialPage = () => {
  const navigate = useNavigate();

  return (
    <Container className='d-flex align-items-center justify-content-center vh-100 bg-dark text-light'>
      <Row className='w-100'>
        <Col md={6} className='d-flex justify-content-center align-items-center'>
          <img 
            src={logo} 
            alt='logo' 
            className='img-fluid rounded-circle shadow-lg' 
            style={{ maxWidth: '350px' }} 
          />
        </Col>
        <Col md={6} className='d-flex flex-column justify-content-center align-items-center text-center'>
            <h1 className='login-title'>Crie ou entre numa pista para começar</h1>
            <Button 
              variant='primary' 
              className='menu-button' 
              onClick={() => navigate('/login')}
            >
              Criar Uma Pista
            </Button>
            <Button 
              variant='secondary' 
              className='menu-button' 
              onClick={() => navigate('/enter-track')}
            >
              Entrar Numa Pista
            </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default InitialPage;