import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface MessagePopupProps {
  data: {
    show: boolean;
    message: string;
    redirectTo?: string;
  }
  handleClose: () => void;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ data, handleClose }) => {
  const navigate = useNavigate();

  const handleClosePopup = () => {
    handleClose();
    if (data.redirectTo) {
      navigate(data.redirectTo);
    }
  };

  return (
    <Modal className='custom-modal' show={data.show} onHide={handleClosePopup}>
      <Modal.Header closeButton style={{ borderBottom: 'none' }}>
        <Modal.Title>Mensagem</Modal.Title>
      </Modal.Header>
      <Modal.Body>{data.message}</Modal.Body>
      <Modal.Footer style={{ borderTop: 'none' }}>
        <Button variant="primary" onClick={handleClosePopup}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MessagePopup;