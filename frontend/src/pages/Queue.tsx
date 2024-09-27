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
import Slider from 'react-slick'; // Importando o Slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type Props = {
  token: string;
};

const Queue: React.FC<Props> = ({ token }) => {
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

  const trackActions = useTrack();
  const djActions = useDJ();
  const playbackActions = usePlayback();

  useEffect(() => {
    const pageType = window.location.pathname.split('/')[1];
    if (pageType !== 'track-info') {
      setIsOwner(false);
    }
  }, []);

  useEffect(() => {
    const fetchQueue = async () => {
      if (trackId && token) {
        const cacheKey = `queue_${trackId}`;
        if (cacheRef.current[cacheKey]) {
          setQueue(cacheRef.current[cacheKey]);
          setIsLoading(false);
          return;
        }

        try {
          const [fetchedTrack, fetchedVerifyLogin, fetchedDJ, fetchedQueue] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(token),
            djActions.getDJByToken(token),
            playbackActions.getQueue(trackId),
          ]);

          if (!isOwner) {
            if (fetchedVerifyLogin?.status !== 200) {
              setPopupMessage('Você não está logado, por favor faça login novamente');
              setRedirectTo('/enter-track');
              setShowPopup(true);
            }
            if (fetchedDJ?.status !== 200) {
              setPopupMessage('Você não é um DJ desta pista, por favor faça login');
              setRedirectTo('/enter-track');
              setShowPopup(true);
            }
          }

          if (fetchedTrack?.status === 200 && fetchedDJ?.status === 200 && fetchedQueue) {
            setTrackFound(true);
            setDJ(fetchedDJ.data);
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
  }, [djActions, isOwner, playbackActions, token, trackActions, trackId]);

  const handleTrackClick = (index: number) => {
    setCurrentTrackIndex(index); // Atualiza o índice da música atual
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
    afterChange: (current: number) => setCurrentTrackIndex(current), // Atualiza o índice após a mudança
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
          <Header />
          <Row>
            {!isOwner && (
              <Col md={3}>
                <Menu dj={dj} />
              </Col>
            )}
            <Col md={isOwner ? 12 : 9} className="py-4">
              <Card
                className="text-center text-light"
                style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
              >
                <Card.Body className='hide-scrollbar' style={{ width: '100%', height: '848px', overflow: 'auto', padding: '0%' }}>
                  {/* Carrossel para exibir a capa do álbum e informações da música */}
                  <div className="mx-auto sticky-carousel d-flex justify-content-center">
                    <div style={{ maxWidth: '300px', marginTop: '10px' }}>
                      <Slider {...settings}>
                        {queue.map((track, index) => (
                          <div key={index} className="text-light" style={{ padding: '20px' }}>
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
                  {queue.length > 0 ? (
                    <Row style={{marginLeft: '50px'}}>
                      {queue.map((track, index) => (
                        <Col md={6} key={index} onClick={() => handleTrackClick(index)}>
                          <ListGroupItem className="mb-3" style={{ backgroundColor: '#000000', borderBottom: 'none'}}>
                            <div className="d-flex justify-content-left align-items-center">
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
                                <div className='text-light' style={{ textAlign: 'left', fontWeight: 'bold' }}>{track.addedBy}</div>
                                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  <div className='text-light' style={{ textAlign: 'left', whiteSpace: 'normal' }}>{track.musicName} - {track.artists}</div>
                                </div>
                              </div>
                            </div>
                          </ListGroupItem>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <h1 style={{ marginTop: '40%' }}>Dispositivo desconectado</h1>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      ) : (
        <Container className="text-center">
          <h1>Esta pista não existe</h1>
          <Button onClick={() => navigate('/')}>Página inicial</Button>
        </Container>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const QueueConnected = connect(mapStateToProps)(Queue);

export default QueueConnected;