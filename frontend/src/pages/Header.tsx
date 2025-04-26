import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, Nav, Button, Modal } from 'react-bootstrap';
import { FaBars, FaInfoCircle, FaShareAlt } from 'react-icons/fa';
import Menu from './Menu';
import ShareTrack from './ShareTrack';
import { DJ } from '../types/DJ';
import { horizontalLogo } from '../assets/images/characterPath';

interface Props {
  dj?: DJ | undefined;
  isSlideMenuOpen?: boolean;
  isTrackOwner: boolean;
  showTrackInfoPopup: (isOpen: boolean) => void;
  toggleMenu?: (isOpen: boolean) => void;
}

const Header: React.FC<Props> = ({ dj, isSlideMenuOpen, isTrackOwner, showTrackInfoPopup, toggleMenu }) => {
  const { trackId } = useParams<{ trackId: string }>();
  const [showPopup, setShowPopup] = useState(false);
  const [pageType, setPageType] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Função para fechar o menu
  const closeMenu = useCallback(() => {
    if (toggleMenu) {
      toggleMenu(false); // Chame a função do Track para fechar o menu
    }
  }, [toggleMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  // Função para alternar o menu
  const toggleLocalMenu = () => {
    if (toggleMenu) {
      toggleMenu(!isSlideMenuOpen); // Use a prop para alternar o estado do menu
    }
  };

  // Funções de abrir/fechar o modal de compartilhar
  const handleClick = () => {
    setShowPopup(true);
  };

  const handleClickLogo = () => {
    if (pageType === 'track') {
      window.location.href = `/track/${trackId}`;
    } else {
      window.location.href = `/track-info/${trackId}`;
    }
  }

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const currentPageType = window.location.pathname.split('/')[1];
    setPageType(currentPageType);
  }, []);

  // Usa a prop `isSlideMenuOpen` para controlar a visibilidade do menu
  const isMenuVisible = isSlideMenuOpen !== undefined ? isSlideMenuOpen : false;

  return (
    <div
      className="text-center text-light"
      style={{ backgroundColor: '#000000' }}
    >
      <div
        ref={menuRef}
        className={`slide-menu ${isMenuVisible ? 'open' : ''}`} // Controla visibilidade com `isMenuVisible`
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '250px',
          height: '100%',
          backgroundColor: '#000',
          color: '#000',
          zIndex: 2000,
          transform: isMenuVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <Menu dj={ dj } isTrackOwner={ isTrackOwner } />
      </div>
      <Navbar
        className="justify-content-between"
        style={{ width: '100%', maxWidth: '100%', margin: '0 auto'}}
      >
        <Nav>
          <Button
            className="d-xxl-none"
            style={{ backgroundColor: '#000', border: 'none', marginLeft: '5px' }}
            onClick={toggleLocalMenu}
          >
            <FaBars className="bi bi-list"></FaBars>
          </Button>
        </Nav>
        <Navbar.Brand className="text-primary" onClick={() => handleClickLogo()} style={{ marginLeft: '180px', cursor: 'pointer' }}>
          <img src={horizontalLogo} alt="horizontal_logo" className="horizontal_logo" style={{width: '200px'}}/>
        </Navbar.Brand>
        <div onClick={handleClick} style={{ marginRight: '30px', cursor: 'pointer' }}>
          {pageType === 'track' ? <FaShareAlt style={{ fontSize: '1.5rem' }} /> : <FaInfoCircle style={{ fontSize: '1.5rem' }} />}
        </div>
      </Navbar>
      <Modal className="custom-modal" show={showPopup} onHide={handleClosePopup} size="lg">
        <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
          <Modal.Title>{pageType === 'track' ? 'Compartilhar Pista' : 'Detalhes da Pista'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ShareTrack trackId={trackId} pageType={pageType} setShowPopup={ showTrackInfoPopup } />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Header;