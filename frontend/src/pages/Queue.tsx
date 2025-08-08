import { lazy, Suspense, useRef, useState } from 'react';
import { Card, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Header from './Header';
import Menu from './Menu';
import TrackInfoPopup from './TrackInfoPopup';
import { logo } from '../assets/images/characterPath';
import { RootState } from '../redux/store'
import useFetchPlaybackData from '../utils/useFetchPlaybackData';
import useFetchTrackData from '../utils/useFetchTrackData';
import useMenu from '../utils/useMenu';
import QueueCarousel from './QueueCarousel';
import QueueList from './QueueList';
import useQueue from '../utils/useQueue';
import Slider from 'react-slick';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy(() => import('./MessagePopup'));
const RankingChangePopup = lazy(() => import('./RankingChangePopup'));
const VotePopup = lazy(() => import('./VotePopup'));

// Define as propriedades esperadas pelo componente Queue
type Props = {
  djToken: string; // Token do DJ, usado para autenticação
  trackToken: string; // Token da pista, usado para autenticação
};

// Define o tipo de dados que serão passados para o componente Queue
const Queue: React.FC<Props> = ({ djToken, trackToken }) => {
  const [ currentTrackIndex, setCurrentTrackIndex ] = useState<number>(0); // Para controlar o índice da música atual
  const sliderRef = useRef<Slider | null>(null); // Referência para o slider

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup,
    setShowTrackInfoPopup, setTrackName, showRankingChangePopup, showTrackInfoPopup, trackId, trackName
  } = useFetchTrackData(djToken, trackToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData(djToken)
  
  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu() // Hook personalizado para lidar com o menu

  const { queue, trackRefs } = useQueue(playingNow, currentTrackIndex)

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
        { /* Popup de alteração de ranking */ }
        <RankingChangePopup
          dj={ dj } // Envia o DJ atual como prop
          currentRanking={ djs } // Envia o ranking atual como prop
          handleClose={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
          previousRanking={ previewRanking } // Envia o ranking anterior como prop
          showRankingChangePopup={ showRankingChangePopup } // Envia o estado do popup como prop
        />
        { /* Popup de informações da pista */ }
        <TrackInfoPopup
          setShow={ setShowTrackInfoPopup } // Função para definir o estado do popup
          setTrackName={ setTrackName } // Função para definir o nome da pista
          show={ showTrackInfoPopup } // Estado do popup de informações da pista
          trackName={ trackName } // Nome da pista
          trackToken={ trackToken } // Token da pista
        />
        { /* popup de votação */ }
        <VotePopup
          djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
          handleClose={ () => setShowVotePopup(false) } // Função para fechar o popup
          playingNow={ playingNow } // Envia o estado de reprodução como prop
          showVotePopup={ showVotePopup } // Envia o estado do popup como prop
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Se sim, exibe o logo de carregamento
        <Container
          className='d-flex justify-content-center align-items-center' // Classes para centralizar o conteúdo
          style={{ height: '100vh' }} // Define a altura do container como 100% da altura da tela
        >
          <Image
            alt='Logo de carregamento' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamento
            src={ logo } // Caminho da imagem
          />
        </Container>
      ) : (
        // se não renderiza o conteúdo principal
        <Container>
          { /* Cabeçalho do componente */ }
          <Header
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
            setShowTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
            showVotePopup={ showVotePopup } // Envia o estado do popup de votação
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista atual
          />
          <Row>
            { /* Menu para o menu lateral, visível apenas em telas grandes */ }
            <Col
              className='d-none d-xxl-block' // Esconde o menu em telas pequenas
              md={ 3 } // Define a largura do menu em telas médias
            >
              { /* Componente de menu */ }
              <Menu
                dj={ dj } // Envia o DJ atual como prop
                isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
                trackId={ Number(trackId) }
              />
            </Col>
            <Col
              className='py-4' // Adiciona padding vertical ao conteúdo
              md={ 12 } xl={ 12 } xxl={ 9 } // Define a largura do conteúdo principal
            >
              { /* Card que contém a fila de músicas */ }
              <Card
                className='text-center text-light' // Classes para centralizar o texto e definir a cor do texto
                // Estilo o card
                style={{
                  backgroundColor: 'transparent', // Cor de fundo do card
                  boxShadow: '0 0 0 0.5px #ffffff' // Sombra do card
                }}
              >
                { /* Corpo do card com carrousel e lista de músicas */ }
                <Card.Body
                  className='hide-scrollbar' // Classe para esconder a barra de rolagem
                  // Define o estilo do corpo do card
                  style={{
                    height: '814px', // Altura do corpo do card
                    paddingTop: '0%', // Padding superior do corpo do card
                    overflow: 'auto', // Permite rolagem automática
                    width: '100%' // Largura do corpo do card
                  }}
                >
                  { /* Verifica se a fila de músicas tem itens */ }
                  { queue.length > 0 ? (
                    // Se sim, renderiza o carrossel e a lista de músicas
                    <Container style={{ height: '100%', width: '100%', paddingTop: 0, overflow: 'hidden' }}>
                      {/* Slider - não rola junto com a lista */}
                      <QueueCarousel
                        currentTrackIndex={ currentTrackIndex } // Índice da música selecionada
                        queue={ queue } // Fila atual
                        setCurrentTrackIndex={ setCurrentTrackIndex }
                        sliderRef={ sliderRef } // Referência para o slider
                      />
                      { /* A área rolável, começa logo após o slider */ }
                      <div
                        style={{
                          height: 'calc(100% - 350px)', // ajuste 240px para a altura real do seu slider
                          overflowY: 'auto', // Define a barra de rolagem vertical
                          overflowX: 'hidden' // Esconede a barra de rolagem horizontal
                        }}
                      >
                        <QueueList
                          currentTrackIndex={ currentTrackIndex } // Índice da música selecionada
                          isTrackOwner={ isTrackOwner } // Verificação pra deifinir se a página tá sendo acessada pelo o dono
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
                    <h3 className='text-light' style={{ marginTop: '40%' }}>Dispositivo desconectado</h3>
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
  djToken: state.djReducer.token, // Token do DJ, usado para autenticação
  trackToken: state.trackReducer.token // Token da pista, usado para autenticação
});

const QueueConnected = connect(mapStateToProps)(Queue); // Conecta o componente Queue ao estado global usando Redux

export default QueueConnected; // Exporta o componente conectado para ser usado em outras partes da aplicação