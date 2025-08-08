import { Button, Modal } from "react-bootstrap";

interface Props {
  showConfirmModal: boolean;
  setShowConfirmModal: (show: boolean) => void;
  confirmExpelDJ: () => void;
}

const ExpelDJConfirmationPopup: React.FC<Props> = ({ showConfirmModal, setShowConfirmModal, confirmExpelDJ }) => {
  return (
    <Modal className='custom-modal' show={ showConfirmModal } onHide={() => setShowConfirmModal(false)}>
      <Modal.Header closeButton style={{ borderBottom: 'none' }}>
        <Modal.Title>Confirmação</Modal.Title>
      </Modal.Header>
      <Modal.Body>Você tem certeza que deseja expulsar este DJ?</Modal.Body>
      <Modal.Footer style={{ borderTop: 'none' }}>
        <Button variant='secondary' onClick={() => setShowConfirmModal(false)}>
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