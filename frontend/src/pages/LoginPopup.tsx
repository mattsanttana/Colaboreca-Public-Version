import { useState, useEffect } from 'react';
import { Button, Col, Container, Image, Modal, OverlayTrigger, Tooltip, Row } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CreateTrackConnected from './CreateTrack';
import { logo } from '../assets/images/characterPath';

interface Props {
  onHide?: () => void;
  show?: boolean;
}

// Popup de login e callback da autenticação
const LoginPopup: React.FC<Props> = ({ onHide, show = true }) => {
  const [code, setCode] = useState(''); // Armazena o código de autenticação
  const [phase, setPhase] = useState(1); // Controla a fase do login (1: tela de login, 2: tela de criação de pista)
  const navigate = useNavigate();

  const handleHide = () => {
    if (onHide) {
      onHide();
    } else {
      navigate('/');
    }
  };

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

  return phase === 1 ? (
    <Modal centered className='custom-modal' dialogClassName='login-popup-dialog' onHide={ handleHide } show={ show }>
      <Modal.Header className='custom-modal-header' closeButton>
        <Modal.Title>Entrar no Colaboreca</Modal.Title>
      </Modal.Header>
      <Modal.Body className='py-2'>
        <Container
        className='d-flex align-items-center justify-content-center text-light' // Classe para centralizar o conteúdo
      >
        <Row
          className='w-100 g-3' // Classe para ocupar toda a largura
        >
          <Col
            className='d-flex justify-content-center align-items-center' // Classe para centralizar o conteúdo
            xs={ 4 } md={ 5 } // Largura da coluna
          >
            { /* Logo do aplicativo */ }
            <Image
              alt='Logo do aplicativo' // Texto alternativo
              className='img-fluid shadow-lg logo' // Classe para estilização
              src={ logo } // Caminho da imagem
              style={{ maxWidth: '100px' }} // Estilo para definir a largura máxima
            />
          </Col>
          <Col
            className='d-flex flex-column justify-content-center align-items-center text-center' // Classe para centralizar o conteúdo
            xs={ 8 } md={ 7 } // Largura da coluna
          >
            { /* Título da página */ }
            <h1 className='login-title' style={{ color: '#fff4c2', fontSize: '1.35rem', margin: 0, textAlign: 'center' }}>
                Escolha uma forma de fazer login
            </h1>
            <Container className='px-0'>
              { /* Botão para login com Spotify Premium */ }
              <Button
                className='menu-button menu-button-spotify mt-2' // Classe para estilização
                onClick={ handleClick } // Função chamada ao clicar no botão
                variant='primary' // Cor do botão
              >
                Entrar Com Spotify Premium
              </Button>
              { /* Tooltip explicativo sobre o Spotify Premium */ }
              <OverlayTrigger
                overlay={
                  // Mensagem que aparece ao passar o mouse
                  <Tooltip>
                    É necessário ter uma conta Spotify Premium porque a versão gratuita não permite adicionar músicas à fila.
                  </Tooltip>
                }
                placement='bottom-start' // Posição do tooltip
              >
                <span className='ms-2'>
                  { /* Ícone de ajuda */ }
                  <FaQuestionCircle
                    // Estilização do ícone de ajuda
                    style={{
                      cursor: 'pointer', // Cursor de ponteiro para indicar que é clicável
                      color: '#ffffff', // Cor do ícone
                      position: 'absolute', // Posição absoluta para sobrepor o botão
                    }}
                  />
                </span>
              </OverlayTrigger>
            </Container>
            { /* Botão para login com YT Music (em breve) */ }
            <Button
              className='menu-button mt-3' // Classe para estilização
              disabled={ true } // Botão desabilitado
              style={{ marginTop: '0.75rem' }} // Estilo para definir a margem superior
              variant='secondary' // Cor do botão
            >
              Entrar com YT Music (Em breve)
            </Button>
          </Col>
        </Row>
        </Container>
      </Modal.Body>
    </Modal>
  ) : (
    <CreateTrackConnected code={ code } />
  );
};

export default LoginPopup;