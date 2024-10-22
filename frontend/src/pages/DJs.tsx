import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Table, Button, Container, Col,
  Row, Card, Popover, OverlayTrigger, Modal
} from 'react-bootstrap';
import { RootState } from '../redux/store';
import MessagePopup from './MessagePopup';
import Podium from './Podium';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';
import useVote from '../utils/useVote';
import { DJ, DJPlayingNow } from '../types/DJ';
import PlayingNow from '../types/PlayingNow';
import { logo } from '../assets/images/characterPath';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const TrackInfoMenu = lazy(() => import('./TrackInfoMenu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  trackToken: string;
  djToken: string;
}

const DJs: React.FC<Props> = ({ trackToken, djToken }) => {
  const { trackId } = useParams();
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [trackFound, setTrackFound] = useState<boolean>(false);
  const [dj, setDJ] = useState<DJ | undefined>(undefined);
  const [djs, setDJs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [showVotePopup, setShowVotePopup] = useState<boolean | undefined>(false);

  const djActions = useDJ();
  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const voteActions = useVote();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

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
    const fetchData = async () => {
      if (trackId) {
        try {
          const [
            fetchedTrack,
            fetchedDJs,
            fetchedPlayingNow,
            fetchedDJPlayingNow,
            fetchedVerifyIfDJHasAlreadVoted
          ] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.getAllDJs(trackId),
            playbackActions.getState(trackId as string),
            playbackActions.getDJAddedCurrentMusic(trackId),
            voteActions.verifyIfDJHasAlreadVoted(djToken)
          ]);
    
          if (fetchedTrack?.status === 200) {
            setTrackFound(true);
            setDJs(fetchedDJs);
            setPlayingNow(fetchedPlayingNow);
            setDJPlayingNow(fetchedDJPlayingNow);
            setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();

    interval.current = setInterval(() => {
      fetchData();
    }, 25000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };

  }, [trackId, djToken, trackActions, djActions, playbackActions, voteActions]);

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
    if (distance > 50) {
      setIsMenuOpen(true); // Abre o menu se o deslize for da esquerda para a direita
    }
  };

  const handleViewProfile = (djId: string) => {
    const profileUrl = isOwner
      ? `/track-info/profile/${trackId}/${djId}`
      : `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const handleExpelDJ = (dj: DJ) => {
    setSelectedDJ(dj);
    setShowConfirmModal(true);
  };

  const confirmExpelDJ = () => {
    if (selectedDJ) {
      trackActions.deleteDJ(String(selectedDJ.id), trackToken)
        .then(response => {
          console.log('DJ expulso com sucesso:', response);
          setDJs(prevDjs => prevDjs.filter(dj => dj.id !== selectedDJ.id));
        })
        .catch(error => {
          console.error('Erro ao expulsar DJ:', error);
        })
        .finally(() => {
          setShowConfirmModal(false);
          setSelectedDJ(null);
        });
    }
  };

  const renderPopover = (pDJ: DJ) => (
  <Popover id={`popover-${pDJ.id}`}>
    <Popover.Body>
      <Button variant="link" onClick={() => handleViewProfile(String(pDJ.id))}>Perfil</Button>
      {(!isOwner && pDJ.id !== dj?.id) && (
        <Button variant="link" onClick={() => console.log(`Chat com DJ: ${pDJ.djName}`)}>Chat</Button>
      )}
    </Popover.Body>
  </Popover>
);

  return (
    <div
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
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
            <Col md={3} className="d-none d-xl-block">
              <TrackInfoMenu trackId={trackId} />
            </Col>
          ) : (
            <Col md={3} className="d-none d-xl-block">
              <Menu dj={dj} />
            </Col>
          )}
            <Col className="py-4">
              <Card className="text-center text-light">
                <Card.Body
                  style={{ backgroundColor: '#000000', padding: '0', width: '100%', height: '845px', overflowY: 'auto' }}
                >
                  <Podium
                    djs={djs}
                    isOwner={false}
                    trackId={trackId}
                    hasDJs={djs.length > 0}
                  />
                  <Card.Title>Ranque:</Card.Title>
                  {djs?.length === 0 ? (
                    <Card.Text>Nenhum DJ entrou na sala.</Card.Text>
                  ) : (
                    <div className="table-responsive">
                      <Table striped>
                        <thead>
                          <tr>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                            </th>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                              Ranque
                            </th>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                              Vulgo
                            </th>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                              Pontos
                            </th>
                            {isOwner && (
                              <>
                                <th
                                  className='text-light'
                                  style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                                >
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {djs.sort((a, b) => a.ranking - b.ranking).map((dj: DJ) => (
                            <tr key={dj.id}>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                <OverlayTrigger
                                  trigger="click"
                                  placement="top"
                                  overlay={renderPopover(dj)}
                                  rootClose
                                >
                                  <img 
                                    src={dj.characterPath} 
                                    alt={dj.djName} 
                                    className='img-thumbnail img-thumbnail-hover' 
                                    style={{ width: '50px', height: '50px', cursor: 'pointer', backgroundColor: '#000000' }} 
                                  />
                                </OverlayTrigger>
                              </td>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                {dj.ranking === 0 ? '-' : dj.ranking}
                              </td>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                {dj.djName}
                              </td>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                {dj.score}
                              </td>
                              {isOwner && (
                                <>
                                  <td
                                    className='text-light'
                                    style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                                  >
                                    <Button variant="danger" onClick={() => handleExpelDJ(dj)}>Expulsar</Button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {showVotePopup && isOwner && (
          <VotePopup
            showVotePopup={showVotePopup}
            playingNow={playingNow}
            djPlayingNow={djPlayingNow}
          />
        )}
        </Container>
      ) : (
        <Container className="text-center">
          <h1>Esta pista não existe</h1>
          <Button onClick={() => navigate("/")}>Página inicial</Button>
        </Container>
      )}

      <Modal className="custom-modal" show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton style={{ borderBottom: 'none' }}>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>Você tem certeza que deseja expulsar este DJ?</Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmExpelDJ}>
            Expulsar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  trackToken: state.trackReducer.token,
  djToken: state.djReducer.token
});

const DJsConnected = connect(mapStateToProps)(DJs);

export default DJsConnected;
