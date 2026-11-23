import '../../styles/tracks/Track.css';
import { lazy, Suspense } from 'react';
import { Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/Header';
import Menu from '../shared/Menu';
import PlaybackState from './PlaybackState';
import Podium from '../ranking/Podium';
import QueuePreview from '../queue/QueuePreview';
import { logo } from '../../assets/images/characterPath';
import { RootState } from '../../redux/store';
import useFetchPlaybackData from '../../utils/useFetchPlaybackData';
import useFetchTrackData from '../../utils/useFetchTrackData';
import useMenu from '../../utils/useMenu';
import useQueue from '../../utils/useQueue';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy(() => import('../shared/MessagePopup'));
const RankingChangePopup = lazy(() => import('../ranking/RankingChangePopup'));
const VotePopup = lazy(() => import('../djs/VotePopup'));

// Props recebidas pelo redux
interface Props {
  token: string; // Token do DJ
}

// Componente principal da página de pista
const Track: React.FC<Props> = ({ token }) => {
  const navigate = useNavigate(); // Hook para navegação

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, globalPreviousRanking, popupMessageData, previousRanking, setPopupMessageData, ownerDJId,
    queueSettings, refreshTrackSettings, setShowRankingChangePopup, setQueueSettings, setTrackName, showRankingChangePopup, trackName, trackId
  } = useFetchTrackData(token);

  // Hook personalizado para buscar dados de reproduçãos
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup, initialVoteCounts,
    cardVisible, displayVoteCounts
  } = useFetchPlaybackData(token);

  const { queue, isLoadingQueue } = useQueue(playingNow)

  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu(); // Hook personalizado para lidar com o menu


  // Renderiza o componente
  return (
    // Envolve o componente em um container para lidar com eventos de toque
    <Container
      onTouchEnd={ handleTouchEnd } // Adiciona evento de toque final
      onTouchMove={ handleTouchMove } // Adiciona evento de movimento do toque
      onTouchStart={ handleTouchStart } // Adiciona evento de toque inicial
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={ <Spinner /> }>
        {/* Popup de mensagem */ }
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          onHide={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
          { /* Popup de alteração de ranking */ }
          <RankingChangePopup
            currentRanking={ djs } // Envia o ranking atual como prop
            dj={ dj } // Envia o DJ atual como prop
            ownerDJId={ ownerDJId } // Envia o ID do DJ dono da pista como prop
            onHide={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
            previousRanking={ previousRanking } // Envia o ranking anterior como prop
            show={ showRankingChangePopup } // Envia o estado do popup como prop
            trackName={ trackName } // Nome da pista'
          />
          { /* Popup de votação */ }
          <VotePopup
            djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
            onHide={ () => setShowVotePopup(false) } // Função para fechar o popup
            playingNow={ playingNow } // Envia o estado de reprodução como prop
            show={ showVotePopup } // Envia o estado do popup como prop
          />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Se sim, exibe o logo de carregamento
        <Container className='d-flex justify-content-center align-items-center track-container' >
          { /* Logo de carregamento */ }
          <Image
            alt='Logo de carregamnto' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamnto
            src={ logo } // Caminho da imagem
          />
        </Container>
      ) : (
        <Container className='gradient-border'>
          { /* Renderiza o cabeçalho */ }
          <Header
            currentRanking={ djs } // Envia o ranking atual como prop
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
            queueSettings={ queueSettings }
            onSettingsChange={ setQueueSettings }
            refreshTrackSettings={ refreshTrackSettings }
            setTrackName={ setTrackName }
            showVotePopup={ showVotePopup } // Envia o estado do popup de votação
            token={ token } // Envia o token do DJ como prop
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista como prop
            trackName={ trackName } // Envia o nome da pista como prop
          />
          <Row>
          { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Col
              className='d-none d-xxl-block' // Classe para que a coluna só renderize em telas não-mobiles 
              md={ 3 } // Largura para telas médias
            >
              { /* Componente de menu */ }
              <Menu
                currentRanking={ djs } // Envia o ranking atual como prop
                dj={ dj } // Envia o DJ atual como prop
                previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
                trackId={ Number(trackId) } // Envia o ID da pista como prop
              />
            </Col>
            { /* Container para o estado de reprodução */ }
            <Col
              className='d-flex flex-column align-items-center gradient-border mb-5 track-mb-5' // Classe para centralizar o conteúdo
              // Largura para diferentes tamanhos de tela
              md={ 12 } lg={ 12 } xl={ 12 } xxl={ 6 }
            >
              { /* Componente de estado de reprodução */ }
              <PlaybackState
                djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
                isTrackOwner={ ownerDJId === dj?.id } // Verifica se o DJ atual é o dono da pista
                votes={ initialVoteCounts } // Envia os votos da música atual como prop
                playingNow={ playingNow } // Envia o estado de reprodução como prop
                trackName={ trackName } // Envia o nom da pista como prop
                cardVisible={ cardVisible } // Envia se o card do DJ está visível como prop
                displayVoteCounts={ displayVoteCounts } // Envia os contadores de votos personalizados como prop
              />
            </Col>
            { /* Renderiza o componente de pódio e fila de reprodução (somente para telas não-mobiles) */ }
            <Col
              className='d-none d-xxl-block' // Classe para que a coluna só renderize em telas não-mobiles
              md={ 3 } // Largura para telas médias
            >
              { /* Componente de pódio */ }
              <div className="track-wrapper gradient-border mb-3 card-hover"
                onClick={ () => navigate(`/track/ranking/${ trackId }`) } // Função para lidar com o clique no pódio
              > 
                <Podium
                  djs={ djs } // Envia a lista de DJs como prop
                  preview
                  trackName={ trackName }
                />
              </div>
              { /* Componente de pré-visualização da fila */ }
              <div
                className='gradient-border mb-3 track-wrapper-2' // Classe para estilizar o container da fila
 // Estilo do container do pódio
              >
                <QueuePreview
                  previewQueue={ queue.slice(0, 5) } // Envia a fila de reprodução como prop
                  isLoading={ isLoadingQueue } // Envia o estado de carregamento da fila como prop
                  trackId={ trackId }
                  playingNow={ playingNow }
                />
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </Container>
  );
}

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.reducer.token, // Token do DJ
});

const TrackConnected = connect(mapStateToProps)(Track); // Conecta o componente ao Redux

export default TrackConnected; // Exporta o componente conectado
