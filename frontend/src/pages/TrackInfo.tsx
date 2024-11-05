import React, { useState, useEffect, useCallback, useRef, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { RootState } from '../redux/store';
import PlaybackState from './PlaybackState';
import Podium from './Podium';
import MessagePopUp from './MessagePopup';
import QueuePreview from './QueuePreview';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';
import PlayingNow from '../types/PlayingNow';
import { DJ, DJPlayingNow } from '../types/DJ';
import { Music } from '../types/SpotifySearchResponse';
import { logo } from '../assets/images/characterPath';
import { Vote } from '../types/Vote';
import useVote from '../utils/useVote';
const Header = lazy(() => import('./Header'));
const TrackInfoMenu = lazy(() => import('./TrackInfoMenu'));

interface Props {
  djToken: string;
  trackToken: string;
}

const TrackInfo: React.FC<Props> = ({ djToken, trackToken }) => {
  const { trackId } = useParams();
  const [trackFound, setTrackFound] = useState<boolean>(false);
  const [trackName, setTrackName] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editedTrackName, setEditedTrackName] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [djs, setDJs] = useState<DJ[]>([]);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [queue, setQueue] = useState<Music[]>([]);
  const [votes, setVotes] = useState<Vote>();
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [messagePopup, setMessagePopup] = useState<{
    show: boolean;
    message: string;
    redirectTo?: string;
  }>({
    show: false,
    message: '',
    redirectTo: undefined
  });

  const djActions = useDJ();
  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const voteActions = useVote();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const interval = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const [
            fetchedOwnerTrack,
            fetchedTrack,
            fetchedDJs,
            fetchedPlayingNow,
            fetchedDJPlayingNow,
            fetchedVotes
          ] = await Promise.all([
            trackActions.verifyTrackAcess(trackToken, trackId),
            trackActions.getTrackById(trackId),
            djActions.getAllDJs(trackId),
            playbackActions.getState(trackId),
            playbackActions.getDJAddedCurrentMusic(trackId),
            voteActions.getAllVotesForThisMusic(trackId, playingNow?.item?.uri ?? "dispositivo não conectado")
          ]);  
  
          if (fetchedOwnerTrack?.status !== 200) {
            setMessagePopup({
              show: true,
              message: 'Você não tem permissão para acessar essa pista',
              redirectTo: '/login'
            });
            return;
          }     
  
          if (fetchedTrack?.status === 200) {
            setPlayingNow(fetchedPlayingNow);
            setDJPlayingNow(fetchedDJPlayingNow);
            setDJs(fetchedDJs);
            setQueue(fetchedDJPlayingNow.spotifyQueue.queue);
            setVotes(fetchedVotes);
            setTrackFound(true);
            setTrackName(fetchedTrack.data.trackName);
            if (!editedTrackName) {
              setEditedTrackName(fetchedTrack.data.trackName);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    fetchData();

    interval.current = window.setInterval(() => {
      fetchData();
    }, 300000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [djActions, editedTrackName, navigate, playbackActions, djToken, trackActions, trackId, trackToken, voteActions]);
  
  useEffect(() => {
    const isSameAsTrack = trackName === editedTrackName;
    const isNameTooShort = editedTrackName.length < 3;
    const isNameTooBig = editedTrackName.length > 16;
    setIsButtonDisabled(isSameAsTrack || isNameTooShort || isNameTooBig);
  }, [trackName, editedTrackName]);

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
  
  const handleClosePopup = () => {
    setEditedTrackName(trackName);
    setShowPopup(false);
    setShowDeleteConfirmation(false);
  };

  const handleSaveChanges = async () => {
    if (!editedTrackName) {
      setMessagePopup({
        show: true,
        message: 'Por favor, preencha todos os campos.',
        redirectTo: undefined
      });
      return;
    }

    const response = await trackActions.updateTrack(editedTrackName, trackToken);

    if (response?.status === 200) {
      setShowPopup(false);
      setTrackName(editedTrackName);
    } else {
      setMessagePopup({
        show: true,
        message: 'Algo deu errado, por favor faça login novamente',
        redirectTo: '/login'
      });
    }
  };

  const handleDeleteTrack = async () => {
    const response = await trackActions.deleteTrack(trackToken);
    if (response?.status === 200) {
      navigate('/login');
    } else {
      setMessagePopup({
        show: true,
        message: 'Erro ao tentar excluir a pista, tente novamente em alguns minutos',
        redirectTo: undefined
      });
    }
  };

  return (
    <div
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      <MessagePopUp
        show={messagePopup.show}
        handleClose={() => setMessagePopup({ ...messagePopup, show: false })}
        message={messagePopup.message}
        redirectTo={messagePopup.redirectTo}
      />
      <Modal className="custom-modal" show={showPopup} onHide={handleClosePopup}>
      <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
          <Modal.Title>{showDeleteConfirmation ? "Excluir Pista" : "Editar Nome da Pista"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {showDeleteConfirmation ? (
            <p>Você tem certeza que quer excluir a pista?</p>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  value={editedTrackName}
                  onChange={(e) => setEditedTrackName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveChanges();
                    }
                  }}
                  className="text-center custom-input"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center" style={{ borderTop: 'none' }}>
          {showDeleteConfirmation ? (
            <>
              <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                Não
              </Button>
              <Button variant="danger" onClick={handleDeleteTrack} className="ms-2">
                Sim
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                disabled={isButtonDisabled}
                onClick={handleSaveChanges}
                className="me-2"
              >
                Salvar
              </Button>
              <Button variant="danger" onClick={() => setShowDeleteConfirmation(true)}>
                Excluir Pista
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      {isLoading ? (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <img src={logo} alt="Loading Logo" className="logo-spinner" />
        </Container>
      ) : trackFound ? (
        <div>
          <Container>
            <Header isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen} trackInfoShowPopup={setShowPopup}/>
            <Row>
              <Col md={3} className="d-none d-xxl-block">
                <TrackInfoMenu trackId={trackId}/>
              </Col>
              <Col
                md={12}
                lg={12}
                xl={12}
                xxl={6}
                className="d-flex flex-column align-items-center playback-state-container"
              >
                <PlaybackState playingNow={playingNow} trackName={ trackName } dj={djPlayingNow} votes={votes}/>
              </Col>
              <Col md={3} className="d-none d-xxl-block">
                <div className="podium-container">
                  <Podium djs={djs} isOwner={true} trackId={trackId} hasDJs={djs.length > 0} />
                </div>
                <div className="queue-container">
                  <QueuePreview trackId={trackId} queue={queue} />
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      ) : (
        <Container className="d-flex align-items-center justify-content-center vh-100">
          <h1 className='text-light'>Pista não encontrada</h1>
        </Container>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token,
  trackToken: state.trackReducer.token
});

const TrackInfoConnected = connect(mapStateToProps)(TrackInfo);

export default TrackInfoConnected;