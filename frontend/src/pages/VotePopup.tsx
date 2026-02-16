import { lazy, Suspense, useEffect, useState } from 'react';
import { Button, Container, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FaQuestionCircle } from 'react-icons/fa';
import { RootState } from '../redux/store';
import { DJPlayingNow } from '../types/DJ';
import PlayingNow from '../types/PlayingNow';
import useVote from '../utils/useVote';
import DJTable from './DJTable';
import VoteThermometer from './VoteThermometer';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy(() => import('./MessagePopup'));

// Props recebidas
interface Props {
  djPlayingNow: DJPlayingNow | null; // DJ que está tocando
  handleClose: () => void; // Função para abrir/fechar o popup de votação
  playingNow: PlayingNow | null; // Música que está tocando
  showVotePopup: boolean; // Estado que controla se o popup de votação está aberto
  token: string; // Token do DJ
}

// Componente principal do popup de votação
const Vote: React.FC<Props> = ({ djPlayingNow, handleClose, showVotePopup, playingNow, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado que controla se o voto está sendo enviado
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Mensagem do popup
  const [vote, setVote] = useState(2); // Estado que controla o voto selecionado (0 a 4)
  
  const voteActions = useVote(); // Hook personalizado para lidar com ações de voto

  useEffect(() => {
    if (!playingNow || !playingNow?.is_playing) {
      handleClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingNow]); // Fecha o popup se a música parar de tocar

  // Função para enviar o voto
  const handleVoteSubmit = async () => {
    const voteOptions = ['very_bad', 'bad', 'normal', 'good', 'very_good']; // Opções de voto
    
    setIsSubmitting(true); // Define o estado de envio como verdadeiro para que o botão se torne um spinner

    try {
      await voteActions.vote(token, playingNow?.item.uri, voteOptions[vote]); // Envia o voto usando o hook personalizado
      handleClose(); // Fecha o popup após enviar o voto
    } catch (error) {
      setPopupMessageData({
        message: 'Erro ao enviar o voto. Tente novamente mais tarde.', // Mensagem de erro
        redirectTo: '', // Redireciona para a página de entrada na pista
        show: true // Exibe o popup de mensagem
      });
    } finally {
      setIsSubmitting(false); // Define o estado de envio como falso para que o botão volte ao normal
    }
  };
  
  // Renderiza o componente
  return (
    <Container>
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={ <Spinner /> }>
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          handleClose={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
      </Suspense>
      <Modal
        className='custom-modal' // Classe personalizada para o modal
        show={ showVotePopup } // Estado do popup de votação
        dialogClassName='vote-modal' /* adiciona classe específica pro modal */
      >
        { /* Cabeçalho do modal */ }
        <Modal.Header className='custom-modal-header'> {/* Classe personalizada para o cabeçalho do modal */ }
          { /* Ícone de ajuda com informações sobre os votos */ }
          <OverlayTrigger
            overlay={
              // Tooltip com informações sobre os votos
              <Tooltip>
                Como funcionam os votos?

                Hino: +3 pontos
                Boa: +1 ponto
                Tanto faz: 0 pontos
                Ruim: -1 ponto
                Ninguém merece: -3 pontos
                Os votos não são acumulativos! A maioria dos votos decide a pontuação que será atribuída à música ou a média entre eles em caso de empate.

                Vote e faça a diferença no ranking! 🎶

                OBS: Votar também é uma forma de ganhar pontos, o voto vale 0,25 pontos e caso o seu voto for o que a maioria votou, você ganha 0,50 pontos.
              </Tooltip>
            }
            placement='bottom-start' // Posição do tooltip
          >
            <div
              className='ms-2' // Classe para adicionar margem
              // Estilo para posicionar o ícone de ajuda
              style={{
                marginTop: '5%', // Margem superior
                position: 'absolute', // Posição absoluta
                right: 40 // Distância da direita
              }}
            >
              { /* Ícone de ajuda */ }
              <FaQuestionCircle
                style={{
                  cursor: 'pointer', // Cursor de ponteiro
                  color: '#ffffff' // Cor do ícone
                }}
              />
            </div>
          </OverlayTrigger>
          <Modal.Title>O que você acha da música que <strong>{ djPlayingNow?.addedBy }</strong> está tocando?</Modal.Title> {/* Título do modal */}
        </Modal.Header>
        { /* Corpo do modal */ }
        <Modal.Body>
          { /* Renderiza a mesa de discotecagem com informações do DJ e da música */ }
          <DJTable
            djPlayingNow={ djPlayingNow } // DJ que está tocando
            playingNow={ playingNow } // Música que está tocando
          />
          { /* Container para o texto rolante do nome da música */ }
          <VoteThermometer
            vote={ vote } // Voto selecionado
            setVote={ setVote } // Função para atualizar o voto
          />
        </Modal.Body>
        { /* Rodapé do modal */ }
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button
            disabled={ isSubmitting } // Desabilita o botão se o estado de envio for verdadeiro
            onClick={ handleVoteSubmit } // Função para enviar o voto
            className='primary-button' // Classe personalizada para o botão
          >
            { isSubmitting ? <Spinner animation='border' size='sm' /> : 'Enviar Voto' } { /* Caso o voto esteja sendo enviado renderiza um spinner no botão */ }
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token, // Token do DJ
});

const VotePopup = connect(mapStateToProps)(Vote); // Conecta o componente ao Redux

export default VotePopup; // Exporta o componente conectado