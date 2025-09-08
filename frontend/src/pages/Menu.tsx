import React from 'react';
import { Container, Nav, Row } from 'react-bootstrap';
import { FaChartLine, FaComments, FaHome, FaList, FaMusic, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { DJ } from '../types/DJ';
import DJProfileMini from './DJProfileMini';

// Recebe as props
type Props = {
  dj?: DJ; // DJ logado (opcional porque o menu também serve pra donos de pistas que não são DJs)
  isTrackOwner: boolean; // Indica se o usuário é o dono da pista ou um DJ
  trackId: number; // ID da pista atual
};

// Componente Menu que é responsável por exibir o menu lateral da aplicação
const Menu: React.FC<Props> = ({ dj, isTrackOwner, trackId }) => {
  const navigate = useNavigate(); // Hook para navegação entre páginas

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
        { /* Se o usuário não for o dono da pista, exibe as informações do DJ */ }
        { !isTrackOwner && dj && (
          <Row className='mb-3 menu-container'>
            <DJProfileMini
              dj={ dj } // Passa o DJ logado para o componente DJProfileMini
            />
          </Row>
        )}
        { /* Itens do menu */ }
        <Nav className='flex-column menu-nav'>
          <Nav.Item className='menu-item'>
            { /* Link para a página inicial da pista */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate(isTrackOwner ? `/track-info/${ trackId }` : `/track/${ trackId }`) } // Redireciona para a página inicial da pista
            >
              <FaHome className='me-2' />Início {/* Ícone de início */}
            </Nav.Link>
          </Nav.Item>
          { /* Se o usuário não for o dono da pista, exibe o item "Perfil" e "Adicioar Músicas à Fila" */ }
          { !isTrackOwner && (
            <>
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
                  <FaMusic className='me-2'/>Adicionar músicas à fila { /* Ícone de adicionar música */ }
                </Nav.Link>
              </Nav.Item>
            </>
          )}
          <Nav.Item className='menu-item'>
            { /* Link para a fila de músicas */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate(isTrackOwner ? `/track-info/queue/${ trackId }` : `/track/queue/${ trackId }`) } // Redireciona para a fila de músicas
            >
              <FaList className='me-2' />Fila { /* Ícone de fila */ }
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            { /* Link para o ranque da pista */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate(isTrackOwner ? `/track-info/ranking/${ trackId }` : `/track/ranking/${ dj?.trackId }`) } // Redireciona para o ranque da pista
            >
              <FaChartLine className='me-2' />Ranque { /* Ícone de ranque */ }
            </Nav.Link>
          </Nav.Item>
          { /* Se o usuário não for o dono da pista, exibe o item "Papinho" */ }
          { !isTrackOwner && (
            <Nav.Item className='menu-item'>
              { /* Link para o chat */ }
              <Nav.Link
                className='d-flex menu-link-bright' // Classe para estilizar o link
                onClick={ () => navigate(`/track/chat/${ trackId }`) } // Redireciona para o chat
              >
                <FaComments className='me-2' />Papinho { /* Ícone de chat */ }
              </Nav.Link>
            </Nav.Item>
          )}
          <Nav.Item className='menu-item'>
            { /* Link para pagina incial do app */ }
            <Nav.Link
              className='d-flex menu-link-bright' // Classe para estilizar o link
              onClick={ () => navigate('/') } // Redireciona para a página inicial do app
            >
              <FaSignOutAlt className='me-2' />Página inicial { /* Ícone de página inicial */ }
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>
    </aside>
  );
};

export default Menu; // exporta o componente Menu
