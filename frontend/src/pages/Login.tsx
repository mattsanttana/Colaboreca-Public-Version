import { useState, useEffect } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import CreateTrackConnected from './CreateTrack';
import { logo } from '../teste_avatares/characterPath';

const Login = () => {
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');

    if (codeParam) {
      setCode(codeParam);
      setPhase(2);
    }
  }, []);

  const handleClick = () => {
    window.location.href = 'http://localhost:3001/tracks/login';
  };

  return (
    phase === 1 ? (
      <Container className='d-flex align-items-center justify-content-center vh-100 text-light'>
        <Row className='w-100'>
          <Col md={6} className='d-flex justify-content-center align-items-center'>
            <img
            src={ logo }
            alt='logo'
            className='img-fluid rounded-circle shadow-lg'
            style={{ maxWidth: '350px' }} 
            />
          </Col>
          <Col md={6} className='d-flex flex-column justify-content-center align-items-center text-center'>
          <h1 className='login-title'>Escolha uma forma de fazer login</h1>
              <Button
                variant='primary'
                className='menu-button'
                onClick={ handleClick }>
                Entrar Com Spotify Premium
              </Button>
              <Button
                variant='secondary'
                className='menu-button'
                disabled={ true }>
                  Entrar com YT Music (Em breve)
              </Button>
          </Col>
        </Row>
      </Container>
    ) : (
      <CreateTrackConnected code={ code } />
    )
  );
};

export default Login;
