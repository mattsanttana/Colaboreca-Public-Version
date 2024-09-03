import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface MessagePopupProps {
  show: boolean;
  handleClose: () => void;
  message: string;
  redirectTo?: string;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ show, handleClose, message, redirectTo }) => {
  const navigate = useNavigate();

  const handleClosePopup = () => {
    handleClose();
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  return (
    <Modal className='custom-modal' show={show} onHide={handleClosePopup}>
      <Modal.Header closeButton style={{ borderBottom: 'none' }}>
        <Modal.Title>Mensagem</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer style={{ borderTop: 'none' }}>
        <Button variant="primary" onClick={handleClosePopup}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MessagePopup;