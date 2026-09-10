import { Button, Modal } from "react-bootstrap";

interface Props {
  show: boolean;
  onHide: () => void; // Função para fechar o modal
  confirmExpelDJ: () => void;
}

const ExpelDJConfirmationPopup: React.FC<Props> = ({ show, onHide, confirmExpelDJ }) => {
  return (
    <Modal className='custom-modal' show={ show } onHide={ onHide }>
      <Modal.Header closeButton style={{ borderBottom: 'none' }}>
        <Modal.Title>Confirmação</Modal.Title>
      </Modal.Header>
      <Modal.Body>Você tem certeza que deseja expulsar este DJ?</Modal.Body>
      <Modal.Footer style={{ borderTop: 'none' }}>
        <Button variant='secondary' onClick={ onHide }>
          Cancelar
        </Button>
        <Button variant='danger' onClick={ confirmExpelDJ }>
          Expulsar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ExpelDJConfirmationPopup;