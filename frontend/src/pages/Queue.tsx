import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from '../redux/store';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, ListGroupItem, OverlayTrigger, Popover, Row, Spinner } from 'react-bootstrap';
import Header from './Header';
import Menu from './Menu';
import MessagePopup from './MessagePopup';
import useDJ from '../utils/useDJ';
import usePlayback from '../utils/usePlayback';
import useTrack from '../utils/useTrack';
import { DJ } from '../types/DJ';
import TQueue from '../types/TQueue';
import { logo } from '../assets/images/characterPath';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import TrackInfoMenu from './TrackInfoMenu';

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
  const cacheRef = useRef<{ [key: string]: TQueue[] }>({});
  const sliderRef = useRef<Slider | null>(null); // Referência para o slider

  const trackActions = useTrack();
  const djActions = useDJ();
  const playbackActions = usePlayback();

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
  }, [djActions, djToken, trackActions, trackId, trackToken]);

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
          const [fetchedTrack, fetchedQueue] = await Promise.all([
            trackActions.getTrackById(trackId),
            playbackActions.getQueue(trackId),
          ]);

          if (fetchedTrack?.status === 200 && fetchedQueue) {
            setTrackFound(true);
            setQueue(fetchedQueue);
            cacheRef.current[cacheKey] = fetchedQueue; // Cache the result
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchQueue();

    const intervalId = setInterval(fetchQueue, 60000); // Aumente o intervalo para 60 segundos

    return () => clearInterval(intervalId);
  }, [djActions, isOwner, playbackActions, djToken, trackActions, trackId]);

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
    <>
      <MessagePopup
        show={showPopup}
        handleClose={() => setShowPopup(false)}
        message={popupMessage}
        redirectTo={redirectTo}
      />
      {isLoading ? (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <h1 className="text-light">Carregando</h1>
          <Spinner animation="border" className="text-light" />
        </Container>
      ) : trackFound ? (
        <Container>
          <Header dj={dj} />
          <Row>
          {isOwner ? (
            <Col md={3} className="d-none d-md-block">
              <TrackInfoMenu trackId={trackId} />
            </Col>
          ) : (
            <Col md={3} className="d-none d-md-block">
              <Menu dj={dj} />
            </Col>
          )}
            <Col md={9} className="py-4">
              <Card
                className="text-center text-light"
                style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
              >
                <Card.Body className='hide-scrollbar' style={{ width: '100%', height: '848px', overflow: 'auto', paddingTop: '0%' }}>
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
                    <Row>
                      {queue.map((track, index) => (
                        <Col md={4} key={index} onClick={() => handleTrackClick(index)}>
                          <ListGroupItem className="mb-3" style={{ backgroundColor: '#000000', borderBottom: 'none', cursor: 'pointer'}}>
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
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token,
  trackToken: state.trackReducer.token,
});

const QueueConnected = connect(mapStateToProps)(Queue);

export default QueueConnected;
