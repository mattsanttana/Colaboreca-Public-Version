// Header.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, Nav, Button, Modal } from 'react-bootstrap';
import ShareTrack from './ShareTrack';
import ShareTrackInfo from './ShareTrackInfo';
import { FaBars } from 'react-icons/fa';
import Menu from './Menu';
import { DJ } from '../types/DJ';
import TrackInfoMenu from './TrackInfoMenu';

interface Props {
  trackInfoShowPopup?: (show: boolean) => void;
  dj?: DJ;
}

const Header: React.FC<Props> = ({ trackInfoShowPopup, dj }) => {
  const { trackId } = useParams<{ trackId: string }>();
  const [showPopup, setShowPopup] = useState(false);
  const [pageType, setPageType] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    // Adiciona o listener de clique ao documento
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Remove o listener ao desmontar o componente
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };
  
  const handleClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const currentPageType = window.location.pathname.split('/')[1];
    setPageType(currentPageType);
  }, []);

  return (
    <div
      className="text-center text-light"
      style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
    >
      <div
            ref={menuRef}
            className={`slide-menu ${isMenuOpen ? 'open' : ''}`}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '250px',
              height: '100%',
              backgroundColor: '#000',
              color: '#000',
              zIndex: 2000,
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease',
            }}
          >
            {pageType === 'track' ? (
              <Menu dj={dj} />
            ) : (
              <TrackInfoMenu trackId={trackId} />
            )}
          </div>
      <Navbar
        className="justify-content-between"
        style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}
      >
        <Nav>
          <Button className="d-md-none" style={{backgroundColor: '#000', border: 'none', marginLeft: '5px'}} onClick={toggleMenu}>
            <FaBars className="bi bi-list"></FaBars>
          </Button>
        </Nav>
        <Navbar.Brand className="text-primary" style={{ marginLeft: '30px' }}>COLABORECA</Navbar.Brand>
        <Button onClick={handleClick} style={{ marginRight: '30px' }} variant='primary'>
          Compartilhar
        </Button>
      </Navbar>
      <Modal className="custom-modal" show={showPopup} onHide={handleClosePopup} size='lg'>
        <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
          <Modal.Title>Compartilhar Pista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pageType === 'track' ? (
            <ShareTrack trackId={trackId} />
          ) : (
            <ShareTrackInfo trackId={trackId} setShowPopup={trackInfoShowPopup || (() => {})} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Header;
