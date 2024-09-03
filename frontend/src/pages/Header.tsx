import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, Nav, Button, Modal } from 'react-bootstrap';
import ShareTrack from './ShareTrack';

const Header = () => {
  const { trackId } = useParams();
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    setShowPopup(true);
  }

  const handleClosePopup = () => {
    setShowPopup(false);
  }

  return (
    <div
      className="text-center text-light"
      style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
    >
      <Navbar
        className="justify-content-between"
        style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}
      >
          <Navbar.Brand className="text-primary" style={{ marginLeft: '30px'}}>COLABORECA</Navbar.Brand>
          <Nav>
              <Button onClick={handleClick} style={{ marginRight: '30px'}} variant='primary'>
                Compartilhar
              </Button>
          </Nav>
      </Navbar>
      <Modal className="custom-modal" show={showPopup} onHide={handleClosePopup} size='lg'>
        <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
          <Modal.Title>Compartilhar Pista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ShareTrack trackId={trackId} />
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Header;