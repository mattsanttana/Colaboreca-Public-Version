import { useState, useEffect, lazy, Suspense  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import useTrack from '../utils/useTrack';

const MessagePopup = lazy(() => import('./MessagePopup')); // Componente que não precisa ser carregado inicialmente

// Props recebidas
interface Props {
  setShow: (show: boolean) => void; // Função para definir o estado do popup
  setTrackName: (name: string) => void; // Função para definir o nome da pista
  show: boolean; // Estado para controlar o popup de informações da pista
  trackName: string; // Nome da pista
  trackToken?: string; // Token da pista 
}

// Componente do popup de informações da pista
const TrackInfoPopup: React.FC<Props> = ({ trackToken, trackName, setTrackName, show, setShow }) => {
  const [editedTrackName, setEditedTrackName] = useState(''); // Estado responsável por armazenar o nome editado da pista
  const [buttonDisabled, setButtonDisabled] = useState(false); // Estado responsável por habilitar/desabilitar o botão
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Estado responsável por armazenar os dados do popup de mensagem
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Estado responsável por controlar a exibição da confirmação de exclusão

  const navigate = useNavigate(); // Hook para navegação
  const trackActions = useTrack(); // Hook personalizado para ações relacionadas à pista
  
  // UseEffect pra verificar se o nome é muito longo, muito curto ou se é igual ao já definido e habilitar/desabilitar o botão dependendo disso
  useEffect(() => {
    const isSameAsTrack = trackName === editedTrackName; // Verifica se o nome editado é igual ao nome da pista
    const isNameTooShort = editedTrackName.length < 3; // Verifica se o nome editado é muito curto
    const isNameTooBig = editedTrackName.length > 32; // Verifica se o nome editado é muito longo
  
    setButtonDisabled(isSameAsTrack || isNameTooShort || isNameTooBig); // Habilita/desabilita o botão dependendo das condições
  }, [trackName, editedTrackName]);
  
  // Função responsável por capturar a mudança na entrada
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setEditedTrackName(value);
  };
  
  // Função para fechar o popup
  const handleClosePopup = () => {
    setEditedTrackName(trackName); // Reseta o nome editado para o nome original da pista
    setShow(false); // Fecha o popup
    setShowDeleteConfirmation(false); // Reseta a confirmação de exclusão
  };

  // Função para excluir a pista
  const handleDeleteTrack = async () => {
    const response = await trackActions.deleteTrack(trackToken ?? ''); // Exclui a pista
    // Verifica se a resposta da exclusão foi bem-sucedida
    if (response?.status === 200) {
      navigate('/login'); // Redireciona para a página de login
      // Caso contrário
    } else {
      // exibe uma mensagem de erro
      setPopupMessageData({
        message: 'Erro ao tentar excluir a pista, tente novamente em alguns minutos', // Mensagem de erro
        redirectTo: '', // Não redireciona
        show: true // Exibe o popup
      });
    }
  };

  // Função para lidar com o evento de tecla pressionada
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !buttonDisabled) {
      handleSaveChanges();
    }
  };

  // Função para salvar as alterações feitas no nome da pista
  const handleSaveChanges = async () => {
    // Verifica se o nome editado está vazio
    if (!editedTrackName) {
      // Caso esteja vazio, exibe uma mensagem de erro
      setPopupMessageData({
        message: 'O nome da pista não pode estar vazio', // Mensagem de erro
        redirectTo: '', // Não redireciona
        show: true // Exibe o popup
      });
      return;
    }

    const response = await trackActions.updateTrack(editedTrackName, trackToken ?? ''); // Atualiza o nome da pista

    // Verifica se a resposta da atualização foi bem-sucedida
    if (response?.status === 200) {
      setShow(false); // Fecha o popup
      setTrackName(editedTrackName); // Atualiza o nome da pista
      // Caso contrário
    } else {
      // exibe uma mensagem de erro
      setPopupMessageData({
        message: 'Erro ao tentar editar a pista, tente novamente em alguns minutos', // Mensagem de erro
        redirectTo: '', // Não redireciona
        show: true // Exibe o popup
      });
    }
  };

  return (
      <Modal
        className='custom-modal' // Classe personalizada para o modal
        onHide={ handleClosePopup } // Função para fechar o popup
        show={ show } // Mostrar o popup
      >
        { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
        <Suspense fallback={<Spinner />}>
        {/* Componente de popup de mensagem */}
          <MessagePopup
            data={ popupMessageData } // Dados da mensagm
            handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })} // Função para fechar o popup
          />
        </Suspense>
        { /* Cabeçalho do popup */}
        <Modal.Header
          className='custom-modal-header' // Classe personalizada para o cabeçalho do modal
          closeButton // Botão de fechar
          style={{ borderBottom: 'none' }} // Remove a borda inferior
        >
          <Modal.Title>{ showDeleteConfirmation ? 'Excluir Pista' : 'Editar Nome da Pista' }</Modal.Title> { /* Título do popup "Excluir Pista/Editar Pista" (dependendo do estado do "showDeleteConfimation") */ }
        </Modal.Header>
        <Modal.Body
          className='text-center' // Classe para centralizar o texto
        >
          { /* Caso o popup esteja em modo de exclusão */ }
          { showDeleteConfirmation ? (
            // Exibe uma mensagem de confirmação
            <p>Você tem certeza que quer excluir a pista?</p>
          ) : (
            <Form>
              <Form.Group
                className='mb-3' // Classe para margem inferior
              >
                { /* Campo de texto para editar o nome da pista */ }
                <Form.Control
                  className='text-center' // Classe para centralizar o texto
                  onChange={ handleChange } // Função para atualizar o nome editado
                  onKeyDown={ handleKeyDown } // Função para lidar com o evento de tecla pressionada
                  // Estilo do campo de texto
                  style={{ 
                    backgroundColor: 'black', // Cor de fundo
                    color: 'white', // Cor do texto
                    border: '1px solid white' // Borda branca
                  }}
                  type='text' // Tipo do campo de texto
                  value={ editedTrackName || trackName } // Valor do campo de texto (nome editado ou nome original)
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        { /* Rodapé do popup */}
        <Modal.Footer
          className='d-flex justify-content-center' // Classe para centralizar o conteúdo
          style={{ borderTop: 'none' }} // Remove a borda superior
        >
          { /* Caso o popup esteja em modo de exclusão */ }
          { showDeleteConfirmation ? (
            // Exibe os botões de confirmação e cancelamento
            <>
              <Button 
                variant='secondary' // Cor do botão
                onClick={ () => setShowDeleteConfirmation(false) } // Função para cancelar a exclusão
              >
                Não
              </Button>
              <Button
                className='ms-2' // Classe para margem esquerda
                onClick={ handleDeleteTrack } // Função para deletar a pista
                variant='danger' // Cor do botão
              >
                Sim
              </Button>
            </>
          // Caso contrário, exibe os botões de salvar e excluir
          ) : (
            <>
              <Button
                className='me-2' // Classe para margem direita
                disabled={ buttonDisabled } // Desabilita o botão se o nome editado for inválido
                onClick={ handleSaveChanges } // Função para salvar as alterações
                variant='primary' // Cor do botão
              >
                Salvar
              </Button>
              <Button
                onClick={() => setShowDeleteConfirmation(true)} // Função para confirmar a exclusão
                variant='danger' // Cor do botão
              >
                Excluir Pista
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
  )
};

export default TrackInfoPopup; // Exporta o componente