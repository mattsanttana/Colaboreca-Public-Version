import { lazy, Suspense, useState } from 'react';
import { Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [ showTrackInfoPopup, setShowTrackInfoPopup ] = useState(false); // Estado responsável por controlar o popup de informações da pista

  const navigate = useNavigate(); // Hook para navegação

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup, setTrackName, showRankingChangePopup, trackName
  } = useFetchTrackData(djToken, trackToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, queue, setShowVotePopup, showVotePopup, votes
  } = useFetchPlaybackData(djToken);

  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu(); // Hook personalizado para lidar com o menu

  // Função para lidar com o clique no pódio
  const handleClickPodium = () => {
    const url = isTrackOwner ?
      `/track-info/djs/${ trackId }` :
      `/track/ranking/${ trackId }`;

    navigate(url); // Redireciona para a página de DJs ou ranking
  };

  const handleClickQueue = () => {
    const url = isTrackOwner ?
      `/track-info/queue/${ trackId }` :
      `/track/queue/${ trackId }`;
    navigate(url); // Redireciona para a página de fila
  };

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
              currentRanking={ djs } // Envia o ranking atual como prop
              dj={ dj } // Envia o DJ atual como prop
              handleClose={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
              previousRanking={ previewRanking } // Envia o ranking anterior como prop
              showRankingChangePopup={ showRankingChangePopup } // Envia o estado do popup como prop
            />
            { /* Popup de votação */ }
            <VotePopup
              djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
              handleClose={ () => setShowVotePopup(false) } // Função para fechar o popup
              playingNow={ playingNow } // Envia o estado de reprodução como prop
              showVotePopup={ showVotePopup } // Envia o estado do popup como prop
            />
          </>
        )}
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Se sim, exibe o logo de carregamento
        <Container
          className='d-flex justify-content-center align-items-center' // Classes para centralizar o conteúdo
          // Estilo do container
          style={{ height: '100vh' }} // Define a altura do container como 100% da altura da tela
        >
          { /* Logo de carregamento */ }
          <Image
            alt='Logo de carregamnto' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamnto
            src={ logo } // Caminho da imagem
          />
        </Container>
      ) : (
        <Container>
          { /* Renderiza o cabeçalho */ }
          <Header
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
            setShowTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
            showVotePopup={ showVotePopup } // Envia o estado do popup de votação
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista como prop
          />
          <Row>
          { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Col
              className='d-none d-xxl-block' // Classe para que a coluna só renderize em telas não-mobiles 
              md={ 3 } // Largura para telas médias
            >
              { /* Componente de menu */ }
              <Menu
                dj={ dj } // Envia o DJ atual como prop
                isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
                trackId={ Number(trackId) } // Envia o ID da pista como prop
              />
            </Col>
            { /* Container para o estado de reprodução */ }
            <Col
              className='d-flex flex-column align-items-center playback-state-container' // Classe para centralizar o conteúdo
              // Largura para diferentes tamanhos de tela
              md={ 12 } lg={ 12 } xl={ 12 } xxl={ 6 }
            >
              { /* Componente de estado de reprodução */ }
              <PlaybackState
                djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
                playingNow={ playingNow } // Envia o estado de reprodução como prop
                trackName={ trackName } // Envia o nom da pista como prop
                votes={ votes } // Envia os votos da música atual como prop
              />
            </Col>
            { /* Renderiza o componente de pódio e fila de reprodução (somente para telas não-mobiles) */ }
            <Col
              className='d-none d-xxl-block' // Classe para que a coluna só renderize em telas não-mobiles
              md={ 3 } // Largura para telas médias
            >
              { /* Componente de pódio */ }
              <Container
                onClick={ handleClickPodium } // Função para lidar com o clique no pódio
                style={{ cursor: 'pointer' }} // Estilo para indicar que o componente é clicável
              >
                <Podium
                  dj={ dj } // Envia o DJ atual como prop
                  djs={ djs } // Envia a lista de DJs como prop
                />
              </Container>
              { /* Componente de pré-visualização da fila */ }
              <Container
                className='queue-container' // Classe para estilizar o container da fila
                onClick={ handleClickQueue } // Função para lidar com o clique na fila
                style={{ cursor: 'pointer' }} // Estilo para indicar que o componente é clicável
              >
                <QueuePreview queue={ queue.slice(0, 5) } /> { /* Envia a fila de reprodução como prop */ }
              </Container>
            </Col>
          </Row>
        </Container>
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