import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Container, Image, ListGroupItem, OverlayTrigger, Popover, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
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
import usePlayback from '../utils/usePlayback';
import TQueue from '../types/TQueue';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy(() => import('./MessagePopup'));
const RankingChangePopup = lazy(() => import('./RankingChangePopup'));
const VotePopup = lazy(() => import('./VotePopup'));

type Props = {
  djToken: string;
  trackToken: string;
};

const Queue: React.FC<Props> = ({ djToken, trackToken }) => {
  const { trackId } = useParams();
  const [ queue, setQueue ] = useState<TQueue[]>([]);
  const [ showTrackInfoPopup, setShowTrackInfoPopup ] = useState(false) // Estado para controlar o popup de informações da pista
  const [ currentTrackIndex, setCurrentTrackIndex ] = useState<number>(0); // Para controlar o índice da música atual
  
  const navigate = useNavigate();
  const playbackActions = usePlayback();
  const sliderRef = useRef<Slider | null>(null); // Referência para o slider
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]); // Referências para os itens da fila

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup, setTrackName, showRankingChangePopup, trackName
  } = useFetchTrackData(trackId, djToken, trackToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData(trackId, djToken)
  
  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu() // Hook personalizado para lidar com o menu

  useEffect(() => {
    const fetchQueueData = async () => {
      if (trackId) {
        const queue = await playbackActions.getQueue(trackId);

        setQueue(queue);
      }
    }

    fetchQueueData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    // Rolar para o item selecionado sempre que currentTrackIndex mudar
    if (trackRefs.current[currentTrackIndex]) {
      trackRefs.current[currentTrackIndex].scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [currentTrackIndex]);

  // Função para pular para o item clicado no carrossel
  const handleTrackClick = (index: number) => {
    setCurrentTrackIndex(index);
    sliderRef.current?.slickGoTo(index); // Atualiza o carrossel para o índice selecionado
  };

  const handleViewProfile = (djId: string) => {
    const profileUrl = isTrackOwner
      ? `/track-info/profile/${trackId}/${djId}`
      : `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const handleStartChat = (djId: number) => {
    const chatUrl = `/track/chat/${trackId}/${djId}`;
    navigate(chatUrl);
  }

  const renderPopover = (djId: number) => (
    <Popover id={`popover-${djId}`}>
      <Popover.Body>
        <Button variant="link" onClick={() => handleViewProfile(String(djId))}>Perfil</Button>
        {(!isTrackOwner && djId !== Number(dj?.id)) && (
          <Button variant="link" onClick={() => handleStartChat(djId)}>Chat</Button>
        )}
      </Popover.Body>
    </Popover>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current: number) => setCurrentTrackIndex(current),
  };

  return (
    // Envolve o componente em um div para lidar com eventos de toque
    <div
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
          showRankingChangePopup={ showRankingChangePopup } // Envia o estado do popup como prop
          dj={ dj } // Envia o DJ atual como prop
          previousRanking={ previewRanking } // Envia o ranking anterior como prop
          currentRanking={ djs } // Envia o ranking atual como prop
          handleClose={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
        />
        { /* Popup de informações da pista */ }
        <TrackInfoPopup
          trackToken={ trackToken } // Token da pista
          trackName={ trackName } // Nome da pista
          setTrackName={ setTrackName } // Função para definir o nome da pista
          show={ showTrackInfoPopup } // Estado do popup de informações da pista
          setShow={ setShowTrackInfoPopup } // Função para definir o estado do popup
        />
        { /* popup de votação */ }
        <VotePopup
          showVotePopup={ showVotePopup } // Envia o estado do popup como prop
          setShowVotePopup={ setShowVotePopup }  // Função para fechar o popup
          playingNow={ playingNow } // Envia o estado de reprodução como prop
          djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Se sim, exibe o logo de carregamento
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <Image src={ logo } alt='Loading Logo' className="logo-spinner" />
        </Container>
      ) : (
        // renderiza o conteúdo principal
        <Container>
          <Header
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop
            isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
            showTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
          />
          <Row>
            <Col md={ 3 } className='d-none d-xxl-block'>
              { /* Componente de menu */ }
              <Menu dj={ dj } isTrackOwner={ isTrackOwner } /> { /* Envia o DJ atual como prop */ }
            </Col>
            <Col
              md={12}
              xl={12}
              xxl={9}
              className="py-4"
            >
              <Card
                className="text-center text-light"
                style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
              >
                <Card.Body className='hide-scrollbar' style={{ width: '100%', height: '814px', overflow: 'auto', paddingTop: '0%' }}>
                  {queue.length > 0 ? (
                    <div>
                      <div className="mx-auto sticky-carousel d-flex justify-content-center">
                        <div style={{ maxWidth: '300px', marginTop: '10px', marginBottom: '20px' }}>
                          <Slider {...settings} ref={sliderRef}>
                            {queue.map((track, index) => (
                              <div key={index}  style={{ padding: '20px' }}>
                                <div className="d-flex justify-content-center">
                                  <img src={track.cover} alt={track.musicName} style={{ width: '150px', height: '150px' }} />
                                </div>
                                <h4>{track.musicName}</h4>
                                <h5>{track.artists}</h5>
                                <p>Adicionado por: {track.addedBy}</p>
                              </div>
                            ))}
                          </Slider>
                        </div>
                      </div>
                    <Row
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    >
                      {queue.map((track, index) => (
                        <Col md={4} key={index} onClick={() => handleTrackClick(index)}>
                          <ListGroupItem
                            className="mb-3"
                            style={{ backgroundColor: '#000000', borderBottom: 'none', cursor: 'pointer'}}
                            ref={(el: never) => (trackRefs.current[index] = el)} // Adiciona a referência ao item da fila
                          >
                            <div className="d-flex justify-content-left align-items-center" style={{ backgroundColor: currentTrackIndex === index ? '#222222' : '', padding: '10px'}}>
                              {track.characterPath ? (
                                <OverlayTrigger
                                  trigger="click"
                                  placement='top'
                                  overlay={renderPopover(track.djId)}
                                  rootClose
                                >
                                  <img
                                    src={track.characterPath}
                                    alt={track.addedBy}
                                    className="img-thumbnail i"
                                    style={{
                                      width: '70px',
                                      height: '70px',
                                      cursor: 'pointer',
                                      backgroundColor: '#000000',
                                    }}
                                  />
                                </OverlayTrigger>
                              ) : (
                                <img
                                  src={logo}
                                  alt="logo"
                                  className="img-thumbnail"
                                  style={{
                                    width: '70px',
                                    height: '70px',
                                    backgroundColor: '#000000',
                                  }}
                                />
                              )}
                              <div className="mx-3 hide-scrollbar" style={{ flexDirection: 'column', margin: '15px', maxWidth: '85%' }}>
                                <div className='text-light' style={{ textAlign: 'left', fontWeight: 'bold' }}>
                                  {track.addedBy}
                                </div>
                                <div style={{ overflow: 'hidden', whiteSpace: 'normal' }}> {/* Ajuste aqui */}
                                  <div className='text-light' style={{ textAlign: 'left' }}>
                                    {track.musicName} - {track.artists}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ListGroupItem>
                        </Col>
                      ))}
                    </Row>
                  </div>
                  ) : (
                    <h3 className="text-light" style={{marginTop: '40%'}}>Dispositivo desconectado</h3>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token,
  trackToken: state.trackReducer.token,
});

const QueueConnected = connect(mapStateToProps)(Queue);

export default QueueConnected;