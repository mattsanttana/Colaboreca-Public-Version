import { Button, Container, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import { Music } from '../types/SpotifySearchResponse';

// Props recebidas pelo componente
interface Props {
  handleClose: () => void; // Função para fechar o modal
  handleConfirm: () => void; // Função para confirmar a adição da música
  isAddingTrack: boolean; // Estado de carregamento da adição da música
  selectedMusic: Music | null; // Música selecionada para adicionar à fila
  show: boolean; // Estado de visibilidade do modal
}

// Componente de popup de confirmação para adicionar música à fila
const AddMusicConfirmationPopup: React.FC<Props> = ({ show, isAddingTrack, selectedMusic, handleClose, handleConfirm }) => (
  <Modal
    className='custom-modal' // Classe personalizada para o modal
    onHide={ handleClose } // Função chamada ao fechar o modal
    show={ show } // Estado de visibilidade do modal
  >
    { /* Cabeçalho do modal com título e botão de fechar */ }
    <Modal.Header
      closeButton // Botão para fechar o modal
      style={{ borderBottom: 'none' }} // Remove a borda inferior do cabeçalho
    >
      <Modal.Title>Confirmação</Modal.Title>
    </Modal.Header>
    { /* Corpo do modal com conteúdo principal */ }
    <Modal.Body>
        <Container>
          <p>{`Deseja adicionar a música '${selectedMusic?.name}' à fila?`}</p>
          { /* Verifica se a música selecionada tem uma prévia */ }
          { selectedMusic?.preview_url ? (
            // Se sim, renderiza o player de áudio para ouvir a prévia
            <Container className='audio-preview'>
              <audio controls>
                <source
                  src={selectedMusic.preview_url}
                  type='audio/mpeg'
                />
                Seu navegador não suporta o elemento de áudio.
              </audio>
            </Container>
          ) : (
            // Se não, exibe uma mensagem informando que não há prévia disponível
            <Container>
              <p style={{ color: '#FFA500' }}>
                Não tem certeza se é essa a música? Dá uma conferida no Spotify antes de confirmar 😉
              </p>
              { /* Botão para ouvir a música no Spotify */ }
              <Button
                className='menu-button-spotify' // Classe para estilizar o botão
                href={`https://open.spotify.com/track/${ selectedMusic?.id }`} // Link para ouvir a música no Spotify
                rel='noopener noreferrer' // Previne ataques de segurança
                target='_blank' // Abre o link em uma nova aba
              >
                Ouvir no Spotify 🎧
              </Button>
              { /* Tooltip para explicar a ausência da prévia */ }
              <OverlayTrigger
                overlay={
                  <Tooltip>
                    Normalmente oferecemos uma prévia da música para você confirmar se 
                    é a que deseja adicionar à fila, mas este recurso não está disponível no momento. 
                    Clique no botão para ouvi-la diretamente no Spotify!
                  </Tooltip>
                }
                placement='bottom-start'
              >
                { /* Ícone de ajuda para explicar a ausência da prévia */ }
                <span className='ms-2'>
                  <FaQuestionCircle style={{ cursor: 'pointer', color: '#ffffff' }} />
                </span>
              </OverlayTrigger>
            </Container>
          )}
        </Container>
    </Modal.Body>
    <Modal.Footer style={{ borderTop: 'none' }}>
      <>
        <Button
          onClick={ handleClose } // Função para fechar o modal
          variant='secondary' // Estilo secundário para o botão
        >
          Cancelar
        </Button>
        <Button
          onClick={ handleConfirm } // Função para confirmar a adição da música
          variant='primary' // Estilo primário para o botão
        >
          { isAddingTrack ? (
            <Spinner
              as='span' // Spinner para indicar carregamento
              animation='border' // Animação de borda
              size='sm' // Tamanho pequeno
              role='status' // Papel de status para acessibilidade
              aria-hidden='true' // Esconde o spinner para leitores de tela
              />
            ) : (
              'Confirmar' // Texto do botão de confirmação
            )
          }
        </Button>
      </>
    </Modal.Footer>
  </Modal>
);

export default AddMusicConfirmationPopup; // Exporta o componente para ser usado em outras partes da aplicação