import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PopupMessageData from '../types/PopupMessageData';

// Props do componente MessagePopup
interface Props {
  data: PopupMessageData;
  handleClose: () => void;
}

// Componente do popup de mensagem
const MessagePopup: React.FC<Props> = ({ data, handleClose }) => {
  const navigate = useNavigate(); // Hook para navegação

  // Função para fechar o popup e redirecionar, se necessário
  const handleClosePopup = () => {
    handleClose(); // Fecha o popup
    // Se houver uma URL para redirecionar, navega para ela
    if (data.redirectTo) {
      navigate(data.redirectTo);
    }
  };

  return (
    <Modal
      className='custom-modal' // Classe para a estilização do modal
      onHide={ handleClosePopup } // Função chamada ao fechar o modal
      show={ data.show } // Indica se o modal deve ser exibido
    >
      <Modal.Header
        closeButton // Botão de fechar
        style={{ borderBottom: 'none' }} // Remove a borda inferior do cabeçalho
      >
        <Modal.Title>Mensagem</Modal.Title> {/* Título do modal */}
      </Modal.Header>
      <Modal.Body>{ data.message }</Modal.Body> {/* Corpo do modal com a mensagem */}
      <Modal.Footer
        style={{ borderTop: 'none' }} // Remove a borda superior do rodapé
      >
        {/* Botão para fechar o modal */}
        <Button
          onClick={ handleClosePopup } // Função chamada ao clicar no botão
          variant='primary' // Cor do botão
        >
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MessagePopup; // Exporta o componente para ser utilizado em outras partes do aplicativo