import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  Table, Button, Container, Col,
  Row, Card, Popover, OverlayTrigger, Modal,
  Tooltip
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
import { FaQuestionCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import RankingChangePopup from './RankingChangePopup';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const TrackInfoMenu = lazy(() => import('./TrackInfoMenu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  trackToken: string;
  djToken: string;
}

const socket = io('http://localhost:3001');

const DJs: React.FC<Props> = ({ trackToken, djToken }) => {
  const { trackId } = useParams();
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [dj, setDJ] = useState<DJ | undefined>(undefined);
  const [djs, setDJs] = useState<DJ[]>([]);
  const [showRankChangePopup, setShowRankChangePopup] = useState<boolean>(false);
  const [previewRank, setPreviewRank] = useState<DJ[]>([]);
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
  const interval = useRef<number | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (trackId) {
        const pageType = window.location.pathname.split('/')[1];
    
        if (pageType !== 'track-info') {
          setIsOwner(false);

          const [ fetchedTrack, fetchedDJData ] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.getDJData(djToken),
          ]);

          if (!fetchedDJData?.data.dj) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedTrack?.status === 200) {
            setDJ(fetchedDJData?.data.dj);
            setDJs(fetchedDJData?.data.djs);
          } else {
            setPopupMessage('Esta pista não existe');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }
        } else {
          setIsOwner(true);

          if (trackId) {
            const [ fetchedVerifyTrackAcess, fetchedDJs ] = await Promise.all([
              trackActions.verifyTrackAcess(trackToken, trackId),
              djActions.getAllDJs(trackId)
            ])

            if (fetchedVerifyTrackAcess?.status !== 200) {
              setPopupMessage('Você não tem permissão para acessar essa pista');
              setRedirectTo('/login');
              setShowPopup(true);
            } else {
              setDJs(fetchedDJs);
            }
          }
        }
      }
    };

    fetchInitialData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      const fetchData = async () => {
        if (trackId && playingNow) {
  
          // Limpar os votos quando a URI da música atual mudar
          setDJPlayingNow(null);
  
          try {
            const [fetchedVerifyIfDJHasAlreadVoted, fetchedDJPlayingNow ] = await Promise.all([
              voteActions.verifyIfDJHasAlreadVoted(djToken),
              playbackActions.getDJAddedCurrentMusic(trackId)
            ]);
  
            setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
            setDJPlayingNow(fetchedDJPlayingNow);
      
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
    const handleDJCreated = (data: { dj: DJ }) => {
      setDJs((prevDJs) => [...prevDJs, data.dj]);
    };

    const handleTrackDeleted = (data: { trackId: number }) => {
      if (Number(trackId) === Number(data.trackId)) {
        setPopupMessage('Esta pista foi deletada');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      }
    };
  
    const handleDJUpdated = (updatedDJ: DJ) => {
      // Atualiza o DJ atual (se aplicável)
      setDJ((currentDJ) => {
        if (currentDJ?.id === updatedDJ.id  && updatedDJ.ranking < currentDJ.ranking) {
          setPreviewRank(djs); // Atualiza o estado previewRank
          setDJs((prevDJs) =>
            prevDJs.map((dj) => {
              if (Number(dj.id) === Number(updatedDJ.id)) {
                return updatedDJ; // Substitui o DJ pelo atualizado
              }
              return dj; // Mantém o DJ atual
            })
          );
          setShowRankChangePopup(true); // Exibe o popup de mudança de ranking
          return updatedDJ; // Atualiza o DJ atual
        } else {
            // Atualiza a lista de DJs
          setDJs((prevDJs) =>
            prevDJs.map((dj) => {
              if (Number(dj.id) === Number(updatedDJ.id)) {
                return updatedDJ; // Substitui o DJ pelo atualizado
              }
              return dj; // Mantém o DJ atual
            })
          );
        }
        return currentDJ; // Mantém o DJ atual
      });
    };

    const handleDJDeleted = (data: { djId: number }) => {
      if (Number(dj) === Number(data.djId)) {
        setPopupMessage('Você foi removido desta pista');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      }
    };

    socket.emit('joinRoom', `track_${trackId}`);
    socket.on('track deleted', handleTrackDeleted);
    socket.on('dj created', handleDJCreated);
    socket.on('dj updated', handleDJUpdated);
    socket.on('dj deleted', handleDJDeleted);

    if (socket.connected && dj) {
      socket.emit('joinRoom', `track_${trackId}`);
    }

    return () => {
      socket.off('track deleted', handleTrackDeleted);
      socket.off('dj created', handleDJCreated);
      socket.off('dj updated', handleDJUpdated);
      socket.off('dj deleted', handleDJDeleted);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj]);

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
    if (distance > 20) {
      setIsMenuOpen(true); // Abre o menu se o deslize for da esquerda para a direita
    }

    if (distance < -20) {
      setIsMenuOpen(false); // Fecha o menu se o deslize for da direita para a esquerda
    }
  };

  const handleViewProfile = (djId: string) => {
    const profileUrl = isOwner
      ? `/track-info/profile/${trackId}/${djId}`
      : `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const handleStartChat = (djId: string) => {
    const chatUrl = `/track/chat/${trackId}/${djId}`;
    navigate(chatUrl);
  }

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

  const handleClosePopup = () => {
    setShowRankChangePopup(false);
  };

  const renderPopover = (pDJ: DJ) => (
    <Popover id={`popover-${pDJ.id}`}>
      <Popover.Body>
        <Button variant="link" onClick={() => handleViewProfile(String(pDJ.id))}>Perfil</Button>
        {(!isOwner && pDJ.id !== dj?.id) && (
          <Button variant="link" onClick={() => handleStartChat(String(pDJ.id))}>Papinho</Button>
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
      ) : (
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
            <Col className="py-4">
              <Card className="text-center text-light">
                <Card.Body
                  style={{ backgroundColor: '#000000', padding: '0', width: '100%', height: '810px', overflowY: 'auto' }}
                >
                  <Row sm={3} md={1} lg={1} xl={3} xxl={3}  style={{width: '90%', marginLeft: '7%'}}>
                    <Podium
                      dj={dj}
                      djs={djs}
                      isOwner={false}
                      trackId={trackId}
                    />
                  </Row>
                  <Card.Title>Ranque:</Card.Title>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        Os DJs são classificados com base na pontuação que acumulam ao longo da competição.

                        Critérios de desempate:
                        1º critério: O DJ com mais votos positivos ou menos votos negativos terá vantagem.
                        2º critério: Se o empate persistir, quem alcançou a pontuação empatada primeiro ocupará a posição mais alta.
                        {!isOwner && (
                          "Use sua criatividade para conquistar votos e subir no ranking! 🎵")}
                      </Tooltip>
                    }
                  >
                    <span className='ms-2' style={{position: 'absolute', marginTop: '-10%', right: 40}}>
                      <FaQuestionCircle style={{ cursor: 'pointer', color: '#ffffff' }} />
                    </span>
                  </OverlayTrigger>
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
                        {djs
                          .sort((a, b) => {
                            if (a.ranking === 0) return 1; // Coloca 'a' no final se o ranking for 0
                            if (b.ranking === 0) return -1; // Coloca 'b' no final se o ranking for 0
                            return a.ranking - b.ranking; // Ordena normalmente se ambos os rankings forem diferentes de 0
                          })
                          .map((dj: DJ) => (
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
                                    style={{ 
                                      width: '50px',
                                      height: '50px',
                                      cursor: 'pointer',
                                      backgroundColor: '#000000',
                                      border: dj.ranking === 1
                                        ? '2px solid #FFD700'
                                        : dj.ranking === 2
                                        ? '2px solid #C0C0C0'
                                        : dj.ranking === 3
                                        ? '2px solid #CD7F32'
                                        : 'none',
                                      boxShadow: dj.ranking === 1 
                                        ? '0 0 10px #FFD700' 
                                        : dj.ranking === 2 
                                        ? '0 0 10px #C0C0C0' 
                                        : dj.ranking === 3 
                                        ? '0 0 10px #CD7F32' 
                                        : 'none',
                                    }} 
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
            setShowVotePopup={setShowVotePopup} 
            playingNow={playingNow}
            djPlayingNow={djPlayingNow}
          />
        )}
        {showRankChangePopup && dj && (
          <RankingChangePopup
            showRankingChangePopup={showRankChangePopup}
            dj={dj}
            previousRanking={previewRank}
            currentRanking={djs}
            handleClosePopup={handleClosePopup}
          />
        )}
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
