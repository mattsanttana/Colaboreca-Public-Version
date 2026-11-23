import '../../styles/queue/Queue.css';
import { lazy, Suspense, useRef, useState } from 'react';
import { Card, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Header from '../shared/Header';
import Menu from '../shared/Menu';
import { logo } from '../../assets/images/characterPath';
import { RootState } from '../../redux/store'
import useFetchPlaybackData from '../../utils/useFetchPlaybackData';
import useFetchTrackData from '../../utils/useFetchTrackData';
import useMenu from '../../utils/useMenu';
import QueueCarousel from './QueueCarousel';
import QueueList from './QueueList';
import useQueue from '../../utils/useQueue';
import Slider from 'react-slick';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy(() => import('../shared/MessagePopup'));
const RankingChangePopup = lazy(() => import('../ranking/RankingChangePopup'));
const VotePopup = lazy(() => import('../djs/VotePopup'));

// Define as propriedades esperadas pelo componente Queue
type Props = {
  token: string; // Token do DJ, usado para autenticação
};

// Define o tipo de dados que serão passados para o componente Queue
const Queue: React.FC<Props> = ({ token }) => {
  const [ currentTrackIndex, setCurrentTrackIndex ] = useState<number>(0); // Para controlar o índice da música atual
  const sliderRef = useRef<Slider | null>(null); // Referência para o slider

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, globalPreviousRanking, popupMessageData, previousRanking, setPopupMessageData, setShowRankingChangePopup,
    ownerDJId, queueSettings, refreshTrackSettings, setQueueSettings, setTrackName, showRankingChangePopup, trackId, trackName
  } = useFetchTrackData(token);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData(token)
  
  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu() // Hook personalizado para lidar com o menu

  const { queue, trackRefs } = useQueue(playingNow, currentTrackIndex)

  return (
    // Envolve o componente em um div para lidar com eventos de toque
    <Container
      className='queue-route'
      onTouchStart={ handleTouchStart } // Adiciona evento de toque inicial
      onTouchMove={ handleTouchMove } // Adiciona evento de movimento do toque
      onTouchEnd={ handleTouchEnd } // Adiciona evento de toque final
    >
      
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
        {/* Componentes de popups de mensagem */}
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          onHide={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
        { /* Popup de alteração de ranking */ }
        <RankingChangePopup
          dj={ dj } // Envia o DJ atual como prop
          currentRanking={ djs } // Envia o ranking atual como prop
          ownerDJId={ ownerDJId } // Envia o ID do DJ dono da pista como prop
          onHide={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
          previousRanking={ previousRanking } // Envia o ranking anterior como prop
          show={ showRankingChangePopup } // Envia o estado do popup como prop
          trackName={ trackName } // Nome da pista
        />
        { /* popup de votação */ }
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
        <Container
          className='d-flex justify-content-center align-items-center queue-container' // Classes para centralizar o conteúdo
 // Define a altura do container como 100% da altura da tela
        >
          <Image
            alt='Logo de carregamento' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamento
            src={ logo } // Caminho da imagem
          />
        </Container>
      ) : (
        // se não renderiza o conteúdo principal
        <Container className='queue-page gradient-border'>
          { /* Cabeçalho do componente */ }
          <Header
            currentRanking={ djs } // Envia o ranking atual como prop
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
            setTrackName={ setTrackName }
            queueSettings={ queueSettings }
            onSettingsChange={ setQueueSettings }
            refreshTrackSettings={ refreshTrackSettings }
            showVotePopup={ showVotePopup } // Envia o estado do popup de votação
            token={ token } // Envia o token do DJ como prop
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista como prop
            trackName={ trackName } // Envia o nome da pista como prop
          />
          <Row className='queue-layout'>
            { /* Menu para o menu lateral, visível apenas em telas grandes */ }
            <Col
              className='d-none d-xxl-block' // Esconde o menu em telas pequenas
              md={ 3 } // Define a largura do menu em telas médias
            >
              { /* Componente de menu */ }
              <Menu
                currentRanking={ djs } // Envia o ranking atual como prop
                dj={ dj } // Envia o DJ atual como prop
                previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
                trackId={ Number(trackId) } // Envia o ID da pista como prop
              />
            </Col>
            <Col
              className='py-4 queue-main-column' // Adiciona padding vertical ao conteúdo
              md={ 12 } xl={ 12 } xxl={ 9 } // Define a largura do conteúdo principal
            >
              { /* Card que contém a fila de músicas */ }
              <Card className='text-center text-light gradient-border queue-panel'>
                { /* Corpo do card com carrousel e lista de músicas */ }
                <Card.Body className='queue-panel-body'>
                  { /* Verifica se a fila de músicas tem itens */ }
                  { queue.length > 0 ? (
                    // Se sim, renderiza o carrossel e a lista de músicas
                    <Container className='queue-content'>
                      {/* Slider - não rola junto com a lista */}
                      <QueueCarousel
                        currentTrackIndex={ currentTrackIndex } // Índice da música selecionada
                        queue={ queue } // Fila atual
                        setCurrentTrackIndex={ setCurrentTrackIndex }
                        sliderRef={ sliderRef } // Referência para o slider
                      />
                      { /* A área rolável, começa logo após o slider */ }
                      <div className='queue-list-scroll'>
                        <QueueList
                          currentTrackIndex={ currentTrackIndex } // Índice da música selecionada
                          queue={ queue } // Fila de reprodução atual
                          setCurrentTrackIndex={ setCurrentTrackIndex }
                          sliderRef={ sliderRef } // Referência para o slider
                          trackId={ Number(trackId) } // ID da pista atual
                          trackRefs={ trackRefs } // Referencia das músicas da lista
                        />
                      </div>
                  </Container>
                  // Se a fila de músicas estiver vazia, exibe uma mensagem informando que não há músicas na fila
                  ) : (
                    <h3 className='queue-empty-state'>Dispositivo desconectado</h3>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </Container>
  );
};

// Mapeia o estado global para as propriedades do componente Queue
const mapStateToProps = (state: RootState) => ({
  token: state.reducer.token, // Token do DJ, usado para autenticação
});

const QueueConnected = connect(mapStateToProps)(Queue); // Conecta o componente Queue ao estado global usando Redux

export default QueueConnected; // Exporta o componente conectado para ser usado em outras partes da aplicação
