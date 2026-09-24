import React, { useState } from 'react';
import { Button, Container, Modal, Nav, Row } from 'react-bootstrap';
import { FaChartLine, FaComments, FaHome, FaList, FaMusic, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { DJ } from '../types/DJ';
import DJProfileMini from './DJProfileMini';

// Recebe as props
type Props = {
  currentRanking: DJ[]; // Ranking atual
  dj: DJ | undefined; // DJ logado
  previousRanking: DJ[]; // Ranking anterior
  trackId: number; // ID da pista atual
};

// Componente Menu que é responsável por exibir o menu lateral da aplicação
const Menu: React.FC<Props> = ({ currentRanking, dj, previousRanking, trackId }) => {
  const navigate = useNavigate(); // Hook para navegação entre páginas
  const [showHomeConfirmation, setShowHomeConfirmation] = useState(false);

  const handleHomeNavigation = () => {
    setShowHomeConfirmation(false);
    navigate('/');
  };

  // Renderiza o componente
  return (
    // Envolve o componente em um container
    <aside
      className='menu-container' // Adiciona a classe CSS para o menu
      style={{
        marginTop: '1%' // Margem superior do menu
      }}
    >
      <Container className='p-3 text-center hide-scroll' style={{ height: '92vh', overflow: 'auto' }}>
        <Row className='mb-3 menu-container'>
          <DJProfileMini
            currentRanking={ currentRanking } // Passa o ranking atual para o componente DJProfileMini
            dj={ dj } // Passa o DJ logado para o componente DJProfileMini
            previousRanking={ previousRanking } // Passa o ranking anterior para o componente DJProfileMini
          />
        </Row>
        { /* Itens do menu */ }
        <Nav className='flex-column menu-nav'>
          <Nav.Item className='menu-item'>
            { /* Link para a página inicial da pista */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate( `/track/${ trackId }`) } // Redireciona para a página inicial da pista
            >
              <FaHome className='me-2' />Início {/* Ícone de início */}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            { /* Link para o perfil do DJ */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate(`/track/profile/${ trackId }/${ dj?.id }`) } // Redireciona para o perfil do DJ
            >
              <FaUser className='me-2'/>Perfil {/* Ícone de perfil */}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
          { /* Link para adicionar música à fila */ }
            <Nav.Link
              className='d-flex menu-link-bright text-start' // Classe para estilizar o link
              onClick={ () => navigate(`/track/add-music/${ trackId }`) } // Redireciona para a página de adicionar música
            >
              <FaMusic className='me-2'/>Adicionar<br/>músicas à fila { /* Ícone de adicionar música */ }
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            { /* Link para a fila de músicas */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate(`/track/queue/${ trackId }`) } // Redireciona para a fila de músicas
            >
              <FaList className='me-2' />Fila { /* Ícone de fila */ }
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            { /* Link para o ranque da pista */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate(`/track/ranking/${ dj?.trackId }`) } // Redireciona para o ranque da pista
            >
              <FaChartLine className='me-2' />Ranque { /* Ícone de ranque */ }
            </Nav.Link>
          </Nav.Item>
          { /* Se o usuário não for o dono da pista, exibe o item "Papinho" */ }
          <Nav.Item className='menu-item'>
            { /* Link para o chat */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate(`/track/chat/${ trackId }`) } // Redireciona para o chat
            >
              <FaComments className='me-2' />Papinho { /* Ícone de chat */ }
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            { /* Link para pagina incial do app */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => setShowHomeConfirmation(true) } // Abre a confirmação antes de redirecionar
            >
              <FaSignOutAlt className='me-2' />Página inicial { /* Ícone de página inicial */ }
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>
      <Modal
        centered
        className='custom-modal'
        onHide={ () => setShowHomeConfirmation(false) }
        show={ showHomeConfirmation }
      >
        <Modal.Header className='custom-modal-header' closeButton>
          <Modal.Title>Confirmar redirecionamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja ser redirecionado para a tela inicial?
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={ () => setShowHomeConfirmation(false) }>
            Cancelar
          </Button>
          <Button className='primary-button' onClick={ handleHomeNavigation }>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </aside>
  );
};

export default Menu; // exporta o componente Menu
