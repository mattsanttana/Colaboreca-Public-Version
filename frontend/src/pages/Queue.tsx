import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, ListGroupItem, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RootState } from '../redux/store';
import MessagePopup from './MessagePopup';
import useDJ from '../utils/useDJ';
import usePlayback from '../utils/usePlayback';
import useTrack from '../utils/useTrack';
import useVote from '../utils/useVote';
import { DJ, DJPlayingNow } from '../types/DJ';
import TQueue from '../types/TQueue';
import PlayingNow from '../types/PlayingNow';
import { logo } from '../assets/images/characterPath';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const TrackInfoMenu = lazy(() => import('./TrackInfoMenu'));
const VotePopup = lazy(() => import('./VotePopup'));

type Props = {
  djToken: string;
  trackToken: string;
};

const Queue: React.FC<Props> = ({ djToken, trackToken }) => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [trackFound, setTrackFound] = useState<boolean>(false);
  const [dj, setDJ] = useState<DJ | undefined>(undefined);
  const [queue, setQueue] = useState<TQueue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0); // Para controlar o índice da música atual
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [showVotePopup, setShowVotePopup] = useState<boolean | undefined>(false);
  
  const cacheRef = useRef<{ [key: string]: TQueue[] }>({});
  const sliderRef = useRef<Slider | null>(null); // Referência para o slider
  const menuRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]); // Referências para os itens da fila
  const trackActions = useTrack();
  const djActions = useDJ();
  const playbackActions = usePlayback();
  const voteActions = useVote();

  useEffect(() => {
    const fetchInitialData = async () => {
      const pageType = window.location.pathname.split('/')[1];
  
      if (pageType !== 'track-info') {
        setIsOwner(false);

        const [fetchVerifyLogin, fetchedMenuDJ] = await Promise.all([
          djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(djToken),
          djActions.getDJByToken(djToken),
        ]);

        if (fetchVerifyLogin?.status !== 200 || fetchedMenuDJ?.status !== 200) {
          setPopupMessage('Você não é um DJ desta pista, por favor faça login novamente');
          setRedirectTo('/enter-track');
          setShowPopup(true);
        } else {
          setDJ(fetchedMenuDJ.data);
        }
      } else {
        setIsOwner(true);

        if (trackId) {
          const verifyOwnerLogin = await trackActions.verifyTrackAcess(trackToken, trackId);
          
          if (verifyOwnerLogin?.status !== 200) {
            setPopupMessage('Você não tem permissão para acessar essa pista');
            setRedirectTo('/login');
            setShowPopup(true);
          }
        }
      }
    };

    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [djToken, trackId, trackToken]);

  useEffect(() => {
    const fetchQueue = async () => {
      if (trackId && djToken) {
        const cacheKey = `queue_${trackId}`;
        if (cacheRef.current[cacheKey]) {
          setQueue(cacheRef.current[cacheKey]);
          setIsLoading(false);
          return;
        }
  
        try {
          const [
            fetchedTrack,
            fetchedQueue,
            fetchedPlayingNow,
            fetchedDJPlayingNow,
            fetchedVerifyIfDJHasAlreadVoted
          ] = await Promise.all([
            trackActions.getTrackById(trackId),
            playbackActions.getQueue(trackId),
            playbackActions.getState(trackId),
            playbackActions.getDJAddedCurrentMusic(trackId),
            voteActions.verifyIfDJHasAlreadVoted(djToken)
          ]);
  
          if (fetchedTrack?.status === 200 && fetchedQueue) {
            setTrackFound(true);
            setQueue(fetchedQueue);
            setPlayingNow(fetchedPlayingNow);
            setDJPlayingNow(fetchedDJPlayingNow);
            setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
            cacheRef.current[cacheKey] = fetchedQueue; // Cache the result
          } else {
            console.error('Error fetching data:', fetchedTrack?.status);
            setPopupMessage('Erro ao buscar a fila.');
            setShowPopup(true);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setPopupMessage('Erro ao buscar a fila. Tente novamente mais tarde.');
          setShowPopup(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    fetchQueue();
  
    const interval = setInterval(fetchQueue, 10000);
  
    return () => clearInterval(interval);
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Rolar para o item selecionado sempre que currentTrackIndex mudar
    if (trackRefs.current[currentTrackIndex]) {
      trackRefs.current[currentTrackIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTrackIndex]);

  const closeMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  // Funções para lidar com o toque
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    // Calcula a distância de deslocamento horizontal
    const distance = touchEndX - touchStartX;
    
    // Define o valor mínimo para considerar um swipe
    if (distance > 200) {
      setIsMenuOpen(true); // Abre o menu se o deslize for da esquerda para a direita
    }
  };

  // Função para pular para o item clicado no carrossel
  const handleTrackClick = (index: number) => {
    setCurrentTrackIndex(index);
    sliderRef.current?.slickGoTo(index); // Atualiza o carrossel para o índice selecionado
  };

  const handleViewProfile = (djId: string) => {
    const profileUrl = isOwner
      ? `/track-info/profile/${trackId}/${djId}`
      : `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const renderPopover = (djId: number) => (
    <Popover id={`popover-${djId}`}>
      <Popover.Body>
        <Button variant="link" onClick={() => handleViewProfile(String(djId))}>Perfil</Button>
        {(!isOwner && djId !== Number(dj?.id)) && (
          <Button variant="link" onClick={() => console.log(`Chat com DJ: ${djId}`)}>Chat</Button>
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
    <div>
      <MessagePopup
        show={showPopup}
        handleClose={() => setShowPopup(false)}
        message={popupMessage}
        redirectTo={redirectTo}
      />
      {isLoading ? (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <img src={logo} alt="Loading Logo" className="logo-spinner" />
        </Container>
      ) : trackFound ? (
        <Container>
          <Header dj={dj} isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen}/>
          <Row>
          {isOwner ? (
            <Col md={3} className="d-none d-xxl-block">
              <TrackInfoMenu trackId={trackId} />
            </Col>
          ) : (
            <Col md={3} className="d-none d-xxl-block">
              <Menu dj={dj} />
            </Col>
          )}
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
                <Card.Body className='hide-scrollbar' style={{ width: '100%', height: '846px', overflow: 'auto', paddingTop: '0%' }}>
                  {queue.length > 0 ? (
                    <div>
                      <div className="mx-auto sticky-carousel d-flex justify-content-center">
                        <div style={{ maxWidth: '300px', marginTop: '10px' }}>
                          <Slider {...settings} ref={sliderRef}>
                            {queue.map((track, index) => (
                              <div key={index}  style={{ padding: '20px' }}>
                                <div className="d-flex justify-content-center">
                                  <img src={track.cover} alt={track.musicName} style={{ width: '200px', height: '200px' }} />
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
                            <div className="d-flex justify-content-left align-items-center" style={{ border: currentTrackIndex === index ? '2px solid white' : 'none'}}>
                              {track.characterPath ? (
                                <OverlayTrigger
                                  trigger="click"
                                  placement='top'
                                  overlay={renderPopover(track.djId)}
                                  rootClose
                                >
                                  <img
                                    src={track.characterPath}
                                    alt={track.musicName}
                                    className="img-thumbnail img-thumbnail-hover"
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
                    {showVotePopup && !isOwner && (
                    <VotePopup
                      showVotePopup={showVotePopup}
                      playingNow={playingNow}
                      djPlayingNow={djPlayingNow}
                    />
                  )}
                  </div>
                  ) : (
                    <h3 className="text-light" style={{marginTop: '40%'}}>Dispositivo desconectado</h3>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      ) : (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <h1 className="text-light">A música não foi encontrada.</h1>
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