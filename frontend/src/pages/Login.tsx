import { useState, useEffect } from 'react';
import { Button, Col, Container, Image, OverlayTrigger, Tooltip, Row } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import CreateTrackConnected from './CreateTrack';
import { logo } from '../assets/images/characterPath';

// Página de login
const Login = () => {
  const [code, setCode] = useState(''); // Armazena o código de autenticação
  const [phase, setPhase] = useState(1); // Controla a fase do login (1: tela de login, 2: tela de criação de pista)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search); // Pega os parâmetros da URL
    const codeParam = params.get('code'); // Pega o código de autenticação

    // Se o código estiver presente na URL, armazena-o no estado e muda a fase
    if (codeParam) {
      setCode(codeParam);
      setPhase(2);
    }
  }, []);

  // Função para redirecionar para a página de login do Spotify
  const handleClick = () => {
    window.location.href = 'http://localhost:3001/tracks/login'; // URL do backend para autenticação
  };

  return (
    // Se a fase for 1, exibe a tela de login
    phase === 1 ? (
      <Container className='d-flex align-items-center justify-content-center vh-100 text-light'>
        <Row className='w-100'>
          <Col className='d-flex justify-content-center align-items-center' md={ 6 }>
            { /* Logo do aplicativo */ }
            <Image
              alt='logo'
              className='img-fluid shadow-lg logo'
              src={logo}
              style={{ maxWidth: '350px' }}
            />
          </Col>
          <Col className='d-flex flex-column justify-content-center align-items-center text-center' md={ 6 }>
            <h1 className='login-title'>Escolha uma forma de fazer login</h1> { /* Título da página */ }
            <Container className='d-flex align-items-center' style={{ width: '100%' }}>
              { /* Botão para login com Spotify Premium */ }
              <Button
                className='menu-button menu-button-spotify'
                onClick={handleClick}
                style={{ marginLeft: '12.5%', marginTop: '20px' }}
                variant='primary'
              >
                Entrar Com Spotify Premium
              </Button>
              {/* Ícone de ajuda */}
              <OverlayTrigger
                overlay={
                  // Tooltip explicando o porquê que é necessário ter uma conta Spotify Premium
                  <Tooltip>
                    É necessário ter uma conta Spotify Premium porque a versão gratuita não permite adicionar músicas à fila.
                  </Tooltip>
                }
                placement='bottom-start'
              >
                <span className='ms-2'>
                  <FaQuestionCircle style={{ cursor: 'pointer', color: '#ffffff' }} />
                </span>
              </OverlayTrigger>
            </Container>
            {/* Botão para login com YT Music (em breve) */}
            <Button
              className='menu-button mt-3'
              disabled={true}
              style={{ marginTop: '20%' }}
              variant='secondary'
            >
              Entrar com YT Music (Em breve)
            </Button>
          </Col>
        </Row>
      </Container>
    // Se a fase for 2, exibe a tela de criação de pista
    ) : (
      <CreateTrackConnected code={code} />
    )
  );
};

export default Login;