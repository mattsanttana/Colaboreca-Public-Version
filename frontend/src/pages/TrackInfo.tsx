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
import { Vote, voteValues } from '../types/Vote';
import useVote from '../utils/useVote';
import { io } from 'socket.io-client';
const Header = lazy(() => import('./Header'));
const TrackInfoMenu = lazy(() => import('./TrackInfoMenu'));

interface Props {
  trackToken: string;
}

const socket = io('http://localhost:3001');

const TrackInfo: React.FC<Props> = ({ trackToken }) => {
  const { trackId } = useParams();
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
        const [ fetchedTrack, fetchedVerifyTrackAcess, fetchedDJData ] = await Promise.all([
          trackActions.getTrackById(trackId),
          trackActions.verifyTrackAcess(trackToken, trackId),
          djActions.getAllDJs(trackId)
        ])

        if (fetchedVerifyTrackAcess?.status !== 200) {
          setMessagePopup({
            show: true,
            message: 'Você não tem permissão para acessar essa pista',
            redirectTo: '/create-track'
          });
        } else {
          setTrackName(fetchedTrack?.data.trackName);
          setEditedTrackName(fetchedTrack?.data.trackName);
          setDJs(fetchedDJData);
        }
      }
    };

    fetchData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId && playingNow) {

        // Limpar os votos quando a URI da música atual mudar
        setVotes(undefined);
        setDJPlayingNow(null);

        try {
          const [ fetchedVotes, fetchedDJPlayingNow] = await Promise.all([
            voteActions.getAllVotesForThisMusic(trackId, playingNow.item?.uri ?? "dispositivo não conectado"),
            playbackActions.getDJAddedCurrentMusic(trackId)
          ]);

          setVotes(fetchedVotes);
          setDJPlayingNow(fetchedDJPlayingNow);
          setQueue(fetchedDJPlayingNow?.spotifyQueue?.queue ?? []);
    
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingNow?.item?.uri || '']);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const fetchedPlayingNow = await playbackActions.getState(trackId)

          setPlayingNow(fetchedPlayingNow);
          
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
    }, 10000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const isSameAsTrack = trackName === editedTrackName;
    const isNameTooShort = editedTrackName.length < 3;
    const isNameTooBig = editedTrackName.length > 32;
  
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

  useEffect(() => {
    const handleTrackUpdated = (updatedTrack: { trackName: string }) => { 
      setTrackName(updatedTrack.trackName);
    }

    const handleTrackDeleted = (data: { trackId: number }) => {
      if (Number(trackId) === Number(data.trackId)) {
        setMessagePopup({
          show: true,
          message: 'Esta pista foi excluída',
          redirectTo: '/enter-track'
        });
        setShowPopup(true);
      }
    };
  
    const handleDJCreated = (data: { dj: DJ }) => {
      setDJs((prevDJs) => [...prevDJs, data.dj]);
    };

    const handleDJUpdated = (updatedDJ: DJ) => {
      // Atualiza a lista de DJs
      setDJs((prevDJs) =>
        prevDJs.map((dj) => {
          if (Number(dj.id) === Number(updatedDJ.id)) {
            return updatedDJ; // Substitui o DJ pelo atualizado
          }
          return dj; // Mantém o DJ atual
        })
      );
    };

    const handleDJDeleted = (data: { id: number}) => {  
      setDJs((prevDJs) => prevDJs.filter((dj) => Number(dj.id) !== Number(data.id)));
    };

    const handleNewVote = (data: { vote: voteValues }) => {
      setVotes((prevVotes) => {
        if (!prevVotes) {
          return { voteValues: [data.vote] };
        }
        return { voteValues: [...prevVotes.voteValues, data.vote] };
      });
    };
  
    socket.emit('joinRoom', `track_${trackId}`);
    socket.on('track updated', handleTrackUpdated);
    socket.on('track deleted', handleTrackDeleted);
    socket.on('dj created', handleDJCreated);
    socket.on('dj updated', handleDJUpdated);
    socket.on('dj deleted', handleDJDeleted);
    socket.on('new vote', handleNewVote);

    if (socket.connected && trackId) {
      socket.emit('joinRoom', `track_${trackId}`);
    }
  
    return () => {
      socket.off('new vote', handleNewVote);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

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
    if (distance > 20) {
      setIsMenuOpen(true); // Abre o menu se o deslize for da esquerda para a direita
    }

    if (distance < -20) {
      setIsMenuOpen(false); // Fecha o menu se o deslize for da direita para a esquerda
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
                  value={editedTrackName || trackName}
                  onChange={(e) => setEditedTrackName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveChanges();
                    }
                  }}
                  className="text-center"
                  style={{ backgroundColor: 'black', color: 'white', border: '1px solid white' }}
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
      ) : (
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
                <PlaybackState playingNow={playingNow} trackName={ trackName } dj={undefined} djPlayingNow={djPlayingNow} votes={votes} isOwner={true} trackId={trackId}/>
              </Col>
              <Col md={3} className="d-none d-xxl-block">
                <div className="podium-container">
                  <Podium dj={undefined} djs={djs} isOwner={true} trackId={trackId} />
                </div>
                <div className="queue-container">
                  <QueuePreview trackId={trackId} queue={queue} />
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  trackToken: state.trackReducer.token
});

const TrackInfoConnected = connect(mapStateToProps)(TrackInfo);

export default TrackInfoConnected;