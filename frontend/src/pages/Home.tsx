import { Button, Container, Image } from 'react-bootstrap';
import { horizontalLogo } from '../assets/images/characterPath';
import { useState } from 'react';
import EnterTrack from './EnterTrack';
import Login from './LoginPopup';

// Página inicial
const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showEnterTrack, setShowEnterTrack] = useState(false);

  return (
    <>
      <Container
        className='d-flex flex-column align-items-center justify-content-center gradient-border'
        style={{
          width: '100%',
          maxWidth: '500px',
          minHeight: '100dvh',
          padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <Image
          alt='Logo horizontal do Colaboreca'
          className='img-fluid shadow-lg mb-4'
          src={ horizontalLogo }
          style={{ maxWidth: '190px' }}
        />
        <h1
          style={{
            color: '#fff4c2',
            fontSize: '2.1rem',
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(255, 244, 194, 0.22), 0 0 24px rgba(76, 201, 240, 0.12)',
          }}
        >
          Comece sua experiência
        </h1>
        <p
          style={{
            color: '#a8dadc',
            marginBottom: '1.5rem',
            maxWidth: '300px',
            textAlign: 'center',
          }}
        >
          Crie uma pista ou entre em uma que já está acontecendo.
        </p>
        <div className='d-flex flex-column gap-3' style={{ width: '100%', maxWidth: '300px' }}>
          <Button
            className='primary-button w-100'
            onClick={ () => setShowLogin(true) }
            variant='primary'
          >
            Criar uma pista
          </Button>
          <Button
            className='w-100'
            onClick={ () => setShowEnterTrack(true) }
            variant='outline-light'
          >
            Entrar numa pista
          </Button>
        </div>
      </Container>
      <Login onHide={ () => setShowLogin(false) } show={ showLogin } />
      <EnterTrack onHide={ () => setShowEnterTrack(false) } show={ showEnterTrack } />
    </>
  );
};

export default Home;