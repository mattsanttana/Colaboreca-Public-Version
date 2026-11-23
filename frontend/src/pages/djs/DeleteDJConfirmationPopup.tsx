import '../../styles/djs/DeleteDJConfirmationPopup.css';
import { Modal, Button } from 'react-bootstrap';
import useDJ from '../../utils/useDJ';
import { useNavigate } from 'react-router-dom';
import PopupMessageData from '../../types/PopupMessageData';
import { DJ } from '../../types/DJ';
import useTrack from '../../utils/useTrack';

// Props para o componente DeleteConfirmationPopup
interface Props {
  dj: DJ | undefined;
  ownerDjId: number | null;
  token: string;
  onHide: () => void; // Função chamada quando o usuário fecha o popup
  setPopupMessageData: (data: PopupMessageData) => void;
  show: boolean; // Estado que controla se o popup está visível
}

// Componente de popup para confirmação de exclusão
const DeleteConfirmationPopup: React.FC<Props> = ({ dj, ownerDjId, token, onHide, setPopupMessageData, show}) => {
  const djActions = useDJ(); // Ações relacionadas ao DJ
  const trackActions = useTrack();
  const navigate = useNavigate(); // Navegação entre páginas
  const isTrackOwner = dj?.id === ownerDjId;

  const handleDeleteTrack = async () => {
    const response = await trackActions.deleteTrack(token);

    if (response?.status === 200) {
      navigate('/');
      return;
    }

    setPopupMessageData({
      message: 'Algo deu errado, por favor tente novamente em alguns instantes',
      redirectTo: '',
      show: true
    });
  };

  // Função para lidar com a exclusão do DJ
  const handleDeleteDJ = async () => {
    // Verifica se o DJ está definido e possui um ID
    if (!dj?.id) {
      // Se não estiver definido, exibe uma mensagem de erro
      setPopupMessageData({
        message: 'Algo deu errado, por favor tente novamente em alguns estantes', // Mensagem de erro
        redirectTo: '', // Não há redirecionamento
        show: true // Exibe o popup
      });
      return;
    } else if (dj.id === ownerDjId) {
      // Se o usuário for o proprietário do DJ, exibe uma mensagem de erro
      setPopupMessageData({
        message: 'Você não pode excluir o DJ pois você é o proprietário da pista, exclua diretamente a pista.', // Mensagem de erro
        redirectTo: '', // Não há redirecionamento
          show: true // Exibe o popup
        });
      return;
    }
  
    const response = await djActions.deleteDJ(token); // Chama a ação para excluir o DJ com o token fornecido
  
    // Verifica se a resposta da exclusão foi bem-sucedida
    if (response?.status === 200) {
      navigate('/'); // Redireciona para a página inicial
    } else {
      // Se a exclusão falhar, exibe uma mensagem de erro
      setPopupMessageData({
        message: 'Algo deu errado, por favor tente novamente em alguns estantes', // Mensagem de erro
        redirectTo: '', // Não há redirecionamento
        show: true // Exibe o popup
      });
    }
  };

  return (
    <Modal
      className='custom-modal' // Classe personalizada para o modal
      onHide={ onHide } // Função chamada ao fechar o modal
      show={ show } // Estado que controla se o modal está visível
    >
      { /* Cabeçalho do modal com título e botão de fechar */ }
      <Modal.Header
        className='custom-modal-header delete-djconfirmation-popup-custom-modal-header' // Classe personalizada para o cabeçalho do modal
        closeButton // Botão para fechar o modal
 // Estilo para remover a borda inferior do cabeçalho
      >
        <Modal.Title>Confirmação de Exclusão</Modal.Title>
      </Modal.Header>
      { /* Corpo do modal com mensagem de confirmação */ }
      <Modal.Body>
        <p className="delete-djconfirmation-popup-text">
          {isTrackOwner
            ? 'Como você é o dono da pista, ao excluir este DJ você também estará excluindo a pista. Tem certeza que deseja continuar?'
            : 'Você tem certeza que quer excluir este DJ?'}
        </p>
      </Modal.Body>
      { /* Rodapé do modal com botões de ação */ }
      <Modal.Footer className="delete-djconfirmation-popup-footer">
        <Button
          className='secondary-button'
          onClick={ onHide } // Função chamada ao clicar no botão de cancelar
        >
          Cancelar
        </Button>
        {isTrackOwner ? (
          <Button
            className='primary-button'
            onClick={ handleDeleteTrack }
          >
            Excluir Pista
          </Button>
        ) : (
          <Button
            className='danger-button'
            onClick={ handleDeleteDJ } // Função chamada ao clicar no botão de confirmar exclusão
          >
            Excluir
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmationPopup; // Exporta o componente DeleteConfirmationPopup para ser usado em outras partes da aplicação
