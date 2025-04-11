import React, { lazy, Suspense } from 'react';
import { Container, Row, Col, Image, Spinner } from 'react-bootstrap';
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
const VotePopup = lazy(() => import('./VotePopup'));

// Props recebidas pelo redux
interface Props {
  token: string; // Token do DJ
}

// Componente principal da página de pista
const Track: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams(); // Pega o ID da pista da URL

  // Hook personalizado para buscar dados da pista
  const {
      dj, djs, trackName, showPopup, popupMessage, redirectTo, setShowPopup, showRankingChangePopup, setShowRankingChangePopup, previewRank
    } = useFetchTrackData(trackId, token);
  const {
  // Hook personalizado para buscar dados de reprodução
    playingNow, djPlayingNow, votes, queue, isLoading, showVotePopup, setShowVotePopup
  } = useFetchPlaybackData(trackId, token)
  const menuActions = useMenu(); // Hook personalizado para lidar com o menu

  // Renderiza o componente
  return (
    // Envolve o componente em um div para lidar com eventos de toque
    <div
      onTouchStart={ menuActions.handleTouchStart } // Adiciona evento de toque inicial
      onTouchMove={ menuActions.handleTouchMove } // Adiciona evento de movimento do toque
      onTouchEnd={ menuActions.handleTouchEnd } // Adiciona evento de toque final
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
      {/* Componente de popup de mensagem */}
        <MessagePopup
          show={ showPopup } // Estado do popup
          handleClose={ () => setShowPopup(false) } // Função para fechar o popup
          message={ popupMessage } // Mensagem a ser exibida
          redirectTo={ redirectTo } // URL para redirecionar
        />
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
              isSlideMenuOpen={ menuActions.isMenuOpen } // Envia o estado do menu como prop
              toggleMenu={ menuActions.setIsMenuOpen } // Função para alternar o estado do menu
            />
            { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Row>
              <Col md={ 3 } className='d-none d-xxl-block'>
                { /* Componente de menu */ }
                <Menu dj={ dj } /> { /* Envia o DJ atual como prop */ }
              </Col>
              { /* Container para o estado de reprodução */ }
              <Col
                md={ 12 } // Largura para telas médias
                lg={ 12 } // Largura para telas grandes
                xl={ 12 } // Largura para telas extra grandes
                xxl={ 6 } // Largura para telas extra extra grandes
                className='d-flex flex-column align-items-center playback-state-container'
              >
                { /* Componente de estado de reprodução */ }
                <PlaybackState
                  playingNow={ playingNow } // Envia o estado de reprodução como prop
                  trackName={ trackName } // Envia o nom da pista como prop
                  dj={ dj } // Envia o DJ atual como prop
                  djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
                  votes={ votes } // Envia os votos da música atual como prop
                  isOwner={ false } // Envia se o usuário é o dono da pista como prop
                  trackId={ trackId } // Envia o ID da pista como prop
                />
              </Col>
              { /* Renderiza o componente de pódio e fila de reprodução (somente para telas não-mobiles) */ }
              <Col
                md={ 3 } // Largura para telas médias
                className='d-none d-xxl-block'
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
                    trackId={ trackId } // Envia o ID da pista como prop
                    queue={ queue } // Envia a fila de músicas como prop
                  />
                </div>
              </Col>
            </Row>
          </Container>
          { /* Renderiza o o componente popup de votação (somente se o popup de votação estiver aberto) */ }
          { showVotePopup && (
            // Componente de popup de votação
            <VotePopup
              showVotePopup={ showVotePopup } // Envia o estado do popup como prop
              setShowVotePopup={ setShowVotePopup }  // Função para fechar o popup
              playingNow={ playingNow } // Envia o estado de reprodução como prop
              djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
            />
          )}
          { /* Renderiza o componente popup de mudança de ranking (somente se o popup de mudança de ranking estiver aberto) */ }
          { showRankingChangePopup && dj && (
            // Componente de popup de mudança de ranking
            <RankingChangePopup
              showRankingChangePopup={ showRankingChangePopup } // Envia o estado do popup como prop
              dj={ dj } // Envia o DJ atual como prop
              previousRanking={ previewRank } // Envia o ranking anterior como prop
              currentRanking={ djs } // Envia o ranking atual como prop
              handleClose={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
            />
          )}
        </>
      )}
    </div>
  );
}

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token // Token do DJ
});

const TrackConnected = connect(mapStateToProps)(Track); // Conecta o componente ao Redux

export default TrackConnected; // Exporta o componente conectado