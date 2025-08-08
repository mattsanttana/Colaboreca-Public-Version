import { useCallback , useEffect, useState, useRef } from 'react';
import { Button, Container, Image, Modal, Navbar } from 'react-bootstrap';
import { FaBars, FaInfoCircle, FaShareAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';
import ShareTrack from './ShareTrack';
import { horizontalLogo } from '../assets/images/characterPath';
import { DJ } from '../types/DJ';

// Props recebidas
interface Props {
  dj?: DJ | undefined; // DJ logado (opcional porque o header também serve pra donos de pistas que não são DJs)
  isSlideMenuOpen?: boolean; // Estado do menu deslizante (opcional porque dispositivos não móveis não têm menu deslizante)
  isTrackOwner: boolean; // Indica se o usuário é o dono da pista ou um DJ
  setShowTrackInfoPopup: (isOpen: boolean) => void; // Função para abrir/fechar o modal com as informações da pista
  showVotePopup?: boolean; // Indica se o popup de votação está aberto (opcional porque não é usado em todos os casos)
  toggleMenu?: (isOpen: boolean) => void; // Função para alternar o menu (opcional porque dispositivos não móveis não têm menu deslizante)
  trackId: string | undefined; // ID da pista atual (necessário para redirecionar corretamente)
}

// Componente Header que é responsável por exibir o cabeçalho da aplicação, incluindo o menu lateral e o botão de compartilhar
const Header: React.FC<Props> = ({ dj, isSlideMenuOpen, isTrackOwner, setShowTrackInfoPopup, showVotePopup, toggleMenu, trackId }) => {
  const [showPopup, setShowPopup] = useState(false); // Estado para controlar a exibição do modal de compartilhamento
  
  const menuRef = useRef<HTMLDivElement>(null); // Referência para o menu deslizante
  const navigate = useNavigate(); // Hook para navegação entre páginas

  // Função para fechar o menu
  const closeMenu = useCallback(() => {
    if (toggleMenu) {
      toggleMenu(false); // Chame a função do Track para fechar o menu
    }
  }, [toggleMenu]);

  // useEffect para adicionar um listener de evento de clique fora do menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica se o clique foi fora do menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu(); // Chama a função para fechar o menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Adiciona o listener de evento de clique fora do menu

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Remove o listener quando o componente é desmontado
    };
  }, [closeMenu]);

  // Função para alternar o menu
  const toggleLocalMenu = () => {
    if (toggleMenu) {
      toggleMenu(!isSlideMenuOpen); // Use a prop para alternar o estado do menu
    }
  };

  // Função para quando clicar no logo redirecinar para a página da pista
  const handleClickLogo = () => {
    navigate(isTrackOwner ? `/track-info/${ trackId }` : `/track/${ trackId }`); // Navega para a página da pista
  };

  return (
    // Container principal do cabeçalho
    <Container
      className='text-center text-light' // Classe para centralizar o texto e definir a cor do texto
    >
      {/* Menu deslizante */}
      <Container
        className={ `slide-menu ${ isSlideMenuOpen ? 'open' : '' }` } // Controla visibilidade do menu
        ref={ menuRef } // Referência para o menu
        // Estilo do menu deslizante
        style={{
          backgroundColor: '#000', // Cor de fundo do menu
          color: '#000', // Cor do texto do menu
          height: '100%', // Altura do menu
          left: 0, // Posição à esquerda
          position: 'fixed', // Posição fixa
          top: 0, // Posição no topo
          transform: isSlideMenuOpen && !showPopup && !showVotePopup ? 'translateX(0)' : 'translateX(-100%)', // Transição para mostrar/ocultar o menu
          transition: 'transform 0.3s ease', // Transição suave
          width: '250px', // Largura do menu
          zIndex: 2000, // Z-index para sobreposição
        }}
      >
        { /* Menu lateral */}
        <Menu
          dj={ dj } // DJ logado
          isTrackOwner={ isTrackOwner } // Indica se o usuário é o dono da pista
          trackId={ Number(trackId) } // ID da pista atual
        />
      </Container>
      { /* Cabeçalho */ }
      <Navbar
        className='w-100' // Classe para justificar o conteúdo entre os itens
        // Estilo do cabeçalho
        style={{
          alignItems: 'center',
          background: 'transparent',
          display: 'flex',
          justifyContent: 'space-between',
          margin: '0 auto', // Centraliza o cabeçalho
          maxWidth: '100%', // Largura máxima do cabeçalho
          width: '100%' // Largura do cabeçalho
        }}
      >
        { /* Botão para abrir o menu deslizante em dispositivos móveis */ }
        <Container
          // Estilo do botão
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'flex-start',
            width: 60
          }}
        >
          <Button
            className='d-xxl-none' // Esconde o botão em telas grandes (não mobile)
            onClick={ toggleLocalMenu } // Chama a função para alternar o menu
            style={{
              backgroundColor: '#000', // Cor de fundo do botão
              border: 'none', // Sem borda
              marginLeft: '5px' // Margem à esquerda
            }}
          >
            <FaBars className='bi bi-list' /> { /* Ícone do botão */ }
          </Button>
        </Container>
        { /* Logo horizontal */ }
        <Container
          style={{
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Navbar.Brand
            className='text-primary' // Classe para definir a cor do texto
            onClick={ handleClickLogo } // Chama a função para redirecionar ao clicar no logo
            // Estilo do logo
            style={{ cursor: 'pointer' }}
          >
            <Image
              alt='Logo "COLABORECA" horizontal' // Texto alternativo da imagem
              src={ horizontalLogo } // Caminho da imagem
              style={{ width: '200px' }} // Estilo da imagem
            />
          </Navbar.Brand>
        </Container>
        { /* Botão para compartilhar a pista ou mostrar detalhes da pista */ }
        <Container
          style={{ 
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'flex-end',
            width: 60,
          }}
        >
          <Container
            className='d-flex align-items-center justify-content-end' // Classe para justificar o conteúdo à direita
            onClick={ () => setShowPopup(true) } // Chama a função para abrir o modal
            // Estilo do botão
            style={{
              cursor: 'pointer', // Cursor de ponteiro ao passar o mouse
              width: '50px', // Largura do botão
            }}
          >
            { 
              isTrackOwner ? // Se não for o dono da pista, mostra o ícone de compartilhar
                <FaInfoCircle style={{ fontSize: '1.5rem' }} /> : // Se for o dono da pista, mostra o ícone de informações
                <FaShareAlt style={{ fontSize: '1.5rem' }} />
            }
          </Container>
        </Container>
      </Navbar>
      { /* Modal para compartilhar a pista ou mostrar detalhes da pista */ }
      <Modal
        className='custom-modal' // Classe personalizada para o modal
        onHide={ () => setShowPopup(false) } // Chama a função para fechar o modal
        show={ showPopup } // Controla a visibilidade do modal
        size='lg' // Tamanho do modal
      >
        { /* Cabeçalho do modal */ }
        <Modal.Header
          className='custom-modal-header' // Classe personalizada para o cabeçalho do modal
          closeButton  // Botão para fechar o modal
          style={{ borderBottom: 'none' }} // Estilo do cabeçalho
        >
          { /* Título do modal */ }
          <Modal.Title>
            { isTrackOwner ? 'Detalhes da Pista' : 'Compartilhar Pista'} { /* "Detalhes da Pista" para o dono da pista e "Compartilhar Pista" para o DJ logado */ }
          </Modal.Title>
        </Modal.Header>
        { /* Corpo do modal */ }
        <Modal.Body>
          { /* Componente de compartilhamento ou detalhes da pista */ }
          <ShareTrack
            pageType={ isTrackOwner ? 'track-info' : 'track' } // Tipo da página (detalhes ou compartilhamento)
            setShowPopup={ setShowTrackInfoPopup } // Função para abrir/fechar o modal
            trackId={ trackId } // ID da pista
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Header; // Componente Header