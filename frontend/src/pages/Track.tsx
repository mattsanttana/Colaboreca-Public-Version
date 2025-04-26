import { lazy, Suspense, useState } from 'react';
import { Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';
import PlaybackState from './PlaybackState';
import Podium from './Podium';
import QueuePreview from './QueuePreview';
import { logo } from '../assets/images/characterPath';
import { RootState } from '../redux/store';
import useFetchPlaybackData from '../utils/useFetchPlaybackData';
import useFetchTrackData from '../utils/useFetchTrackData';
import useMenu from '../utils/useMenu';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy(() => import('./MessagePopup'));
const RankingChangePopup = lazy(() => import('./RankingChangePopup'));
const TrackInfoPopup = lazy(() => import('./TrackInfoPopup'));
const VotePopup = lazy(() => import('./VotePopup'));

// Props recebidas pelo redux
interface Props {
  djToken: string; // Token do DJ
  trackToken: string; // Token da pista
}

// Componente principal da página de pista
const Track: React.FC<Props> = ({ djToken, trackToken }) => {
  const { trackId } = useParams(); // Pega o ID da pista da URL
  const [ showTrackInfoPopup, setShowTrackInfoPopup ] = useState(false) // Estado responsável por controlar o popup de informações da pista

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup, setTrackName, showRankingChangePopup, trackName
  } = useFetchTrackData(trackId, djToken, trackToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, queue, setShowVotePopup, showVotePopup, votes
  } = useFetchPlaybackData(trackId, djToken)

  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu() // Hook personalizado para lidar com o menu

  // Renderiza o componente
  return (
    // Envolve o componente em um div para lidar com eventos de toque
    <Container
      onTouchStart={ handleTouchStart } // Adiciona evento de toque inicial
      onTouchMove={ handleTouchMove } // Adiciona evento de movimento do toque
      onTouchEnd={ handleTouchEnd } // Adiciona evento de toque final
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
        {/* Componentes de popups de mensagem */}
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          handleClose={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
        { /* Popup de informações da pista */ }
        <TrackInfoPopup
          setShow={ setShowTrackInfoPopup } // Função para definir o estado do popup
          setTrackName={ setTrackName } // Função para definir o nome da pista
          show={ showTrackInfoPopup } // Estado do popup de informações da pista
          trackName={ trackName } // Nome da pista
          trackToken={ trackToken } // Token da pista
        />
        { !isTrackOwner && (
          <>
            { /* Popup de alteração de ranking */ }
            <RankingChangePopup
              currentRanking={djs} // Envia o ranking atual como prop
              dj={dj} // Envia o DJ atual como prop
              handleClose={() => setShowRankingChangePopup(false)} // Função para fechar o popup
              previousRanking={previewRanking} // Envia o ranking anterior como prop
              showRankingChangePopup={showRankingChangePopup} // Envia o estado do popup como prop
            />
            { /* Popup de votação */ }
            <VotePopup
              djPlayingNow={djPlayingNow} // Envia o DJ que está tocando a música atual como prop
              playingNow={playingNow} // Envia o estado de reprodução como prop
              setShowVotePopup={setShowVotePopup} // Função para fechar o popup
              showVotePopup={showVotePopup} // Envia o estado do popup como prop
            />
          </>
        )}
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Se sim, exibe o logo de carregamento
        <Container
          className='d-flex justify-content-center align-items-center'
          style={{ height: '100vh' }} // Define a altura do container como 100% da altura da tela
        >
          <Image src={ logo } alt='Loading Logo' className='logo-spinner' /> { /* Logo de carregamento */ }
        </Container>
      ) : (
        <>
          { /* Renderiza o conteúdo principal */ }
          <Container>
            { /* Renderiza o cabeçalho */ }
            <Header
              dj={ dj } // Envia o DJ atual como prop
              isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop
              isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
              showTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
              toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            />
            { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Row>
              <Col className='d-none d-xxl-block' md={ 3 }>
                { /* Componente de menu */ }
                <Menu dj={ dj } isTrackOwner={ isTrackOwner } /> { /* Envia o DJ atual como prop */ }
              </Col>
              { /* Container para o estado de reprodução */ }
              <Col
                className='d-flex flex-column align-items-center playback-state-container'
                md={ 12 } // Largura para telas médias
                lg={ 12 } // Largura para telas grandes
                xl={ 12 } // Largura para telas extra grandes
                xxl={ 6 } // Largura para telas extras extra grandes
              >
                { /* Componente de estado de reprodução */ }
                <PlaybackState
                  dj={ dj } // Envia o DJ atual como prop
                  djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
                  isOwner={ false } // Envia se o usuário é o dono da pista como prop
                  playingNow={ playingNow } // Envia o estado de reprodução como prop
                  trackId={ trackId } // Envia o ID da pista como prop
                  trackName={ trackName } // Envia o nom da pista como prop
                  votes={ votes } // Envia os votos da música atual como prop
                />
              </Col>
              { /* Renderiza o componente de pódio e fila de reprodução (somente para telas não-mobiles) */ }
              <Col
                className='d-none d-xxl-block'
                md={ 3 } // Largura para telas médias
              >
                { /* Componente de pódio */ }
                <div>
                  <Podium
                    dj={ dj } // Envia o DJ atual como prop
                    djs={ djs } // Envia a lista de DJs como prop
                    isOwner={ false } // Envia se o usuário é o dono da pista como prop
                    trackId={ trackId } // Envia o ID da pista como prop
                  />
                </div>
                { /* Componente de pré-visualização da fila */ }
                <div className='queue-container'>
                  <QueuePreview
                    queue={ queue } // Envia a fila de músicas como prop
                    trackId={ trackId } // Envia o ID da pista como prop
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </>
      )}
    </Container>
  );
}

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token, // Token do DJ
  trackToken: state.trackReducer.token // Token da pista
});

const TrackConnected = connect(mapStateToProps)(Track); // Conecta o componente ao Redux

export default TrackConnected; // Exporta o componente conectado