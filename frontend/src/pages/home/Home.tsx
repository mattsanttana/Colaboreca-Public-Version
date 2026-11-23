import '../../styles/home/Home.css';
import { Button, Container, Image } from 'react-bootstrap';
import { horizontalLogo } from '../../assets/images/characterPath';
import { useState } from 'react';
import EnterTrack from '../tracks/EnterTrack';
import Login from '../access/LoginPopup';

// Página inicial
const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showEnterTrack, setShowEnterTrack] = useState(false);

  return (
    <>
      <Container
        className='d-flex flex-column align-items-center justify-content-center gradient-border home-container'

      >
        <Image
          alt='Logo horizontal do Colaboreca'
          className='img-fluid shadow-lg mb-4 home-image'
          src={ horizontalLogo }

        />
        <h1 className="home-title"

        >
          Comece sua experiência
        </h1>
        <p className="home-text"

        >
          Crie uma pista ou entre em uma que já está acontecendo.
        </p>
        <div className='d-flex flex-column gap-3 home-wrapper'>
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
