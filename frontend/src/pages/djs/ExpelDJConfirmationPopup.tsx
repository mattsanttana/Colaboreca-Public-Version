import '../../styles/djs/ExpelDJConfirmationPopup.css';
import { Button, Modal } from "react-bootstrap";

interface Props {
  show: boolean;
  onHide: () => void; // Função para fechar o modal
  confirmExpelDJ: () => void;
}

const ExpelDJConfirmationPopup: React.FC<Props> = ({ show, onHide, confirmExpelDJ }) => {
  return (
    <Modal className='custom-modal' show={ show } onHide={ onHide }>
      <Modal.Header className="expel-djconfirmation-popup-header" closeButton>
        <Modal.Title>Confirmação</Modal.Title>
      </Modal.Header>
      <Modal.Body>Você tem certeza que deseja expulsar este DJ?</Modal.Body>
      <Modal.Footer className="expel-djconfirmation-popup-footer">
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
