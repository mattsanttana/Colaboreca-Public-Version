import React, { useCallback, useEffect, useRef, useState, lazy, useMemo } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../redux/store';
import { Card, Col, Container, Form, Row, Spinner, Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import MessagePopup from './MessagePopup';
import useDebounce from '../utils/useDebounce';
import usePlayback from '../utils/usePlayback';
import useDJ from '../utils/useDJ';
import useVote from '../utils/useVote';
import { Music } from '../types/SpotifySearchResponse';
import { DJ, DJPlayingNow } from '../types/DJ';
import PlayingNow from '../types/PlayingNow';
import { logo } from '../assets/images/characterPath';
import { io } from 'socket.io-client';
import useTrack from '../utils/useTrack';
import { FaQuestionCircle } from 'react-icons/fa';
import RankingChangePopup from './RankingChangePopup';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  token: string;
}

const socket = io('http://localhost:3001');

const AddMusicToQueue: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [dj, setDJ] = useState<DJ>();
  const [djs, setDJs] = useState<DJ[]>([]);
  const [previewRank, setPreviewRank] = useState<DJ[]>([]);
  const [showRankChangePopup, setShowRankChangePopup] = useState(false);
  const [topTracksInBrazil, setTopTracksInBrazil] = useState<Music[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Music[]>([]);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Music | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [showVotePopup, setShowVotePopup] = useState<boolean | undefined>(false);

  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const djActions = useDJ();
  const voteActions = useVote();
  const debouncedSearch = useDebounce(search, 600);
  const menuRef = useRef<HTMLDivElement>(null);
  const interval = useRef<number | null>(null);

  // useEffect para carregar as músicas populares no Brasil apenas uma vez
  useEffect(() => {
    const fetchTopTracksInBrazil = async () => {
      try {
        const response = await playbackActions.getTopMusicsInBrazil(trackId);
        if (response?.status === 200) {
          setTopTracksInBrazil(response.data);
        } else {
          console.error('Error fetching top tracks in Brazil');
        }
      } catch (error) {
        console.error('Error fetching top tracks in Brazil:', error);
      }
    };

    fetchTopTracksInBrazil();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchedData = async () => {
      if (trackId) {
        try {
          const [fetchedTrack, fetchedDJData] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.getDJData(token)
          ]);
  
          if (!fetchedDJData?.data.dj) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedTrack?.status === 200) {
            setDJ(fetchedDJData?.data.dj);
          } else {
            setPopupMessage('Esta pista não existe');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchedData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      const fetchData = async () => {
        if (trackId && playingNow) {

          setDJPlayingNow(null);

          try {
            const [fetchedVerifyIfDJHasAlreadVoted, fetchedDJPlayingNow] = await Promise.all([
              voteActions.verifyIfDJHasAlreadVoted(token),
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
    if (debouncedSearch.trim() === '') {
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      setIsDebouncing(true);
      try {
        const response = await playbackActions.getTrackBySearch(trackId, debouncedSearch);
        if (response?.status !== 200) {
          console.error('Error response from Spotify:', response?.data);
          return;
        } else {
          console.log(response.data);
          setSearchResults(response.data);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setIsDebouncing(false);
      }
    };

    fetchSearchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, trackId]);

  const closeMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (socket.connected && dj) {
      socket.emit('joinRoom', `track_${trackId}`);
    }

    const handleTrackDeleted = (data: { trackId: number }) => {
      if (Number(trackId) === Number(data.trackId)) {
        setPopupMessage('Esta pista foi deletada');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      }
    }

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

      // Atualiza o DJ atual (se aplicável)
      setDJ((currentDJ) => {
        if (currentDJ?.id === updatedDJ.id) {
          const updatedDJRanking = updatedDJ.ranking === 0 ? Infinity : updatedDJ.ranking;
          const currentDJRanking = currentDJ.ranking === 0 ? Infinity : currentDJ.ranking;
          if (updatedDJRanking < currentDJRanking) {
            setPreviewRank(djs); // Atualiza o estado previewRank
            setShowRankChangePopup(true); // Exibe o popup de mudança de ranking
          }
          return updatedDJ; // Atualiza o DJ atual
        }
        return currentDJ; // Mantém o DJ atual
      });
    };

    const handleDJDeleted = (data: { djId: number }) => {
      if (Number(dj?.id) === Number(data.djId)) {
        setPopupMessage('Você foi removido desta pista');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      }
    };

    socket.emit('joinRoom', `track_${trackId}`);
    socket.on('track deleted', handleTrackDeleted);
    socket.on('dj updated', handleDJUpdated);
    socket.on('dj deleted', handleDJDeleted);
  
    return () => {
      socket.off('track deleted', handleTrackDeleted);
      socket.off('dj updated', handleDJUpdated);
      socket.off('dj deleted', handleDJDeleted);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj]);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }

  const handleClick = (track: Music) => {
    setSelectedTrack(track);
    setShowModal(true);
  }

  const handleConfirmAddTrack = async () => {
    if (selectedTrack) {
      setIsAddingTrack(true);
      try {
        const addMusic = await playbackActions.addTrackToQueue(
          trackId,
          selectedTrack.album.images[0].url,
          selectedTrack.name,
          selectedTrack.artists.map((artist) => artist.name).join(', '),
          selectedTrack.uri,
          token
        );

        if (addMusic?.status === 200) {
          handleCloseModal();
        }

        if (addMusic?.status === 401) {
          handleCloseModal();
          setPopupMessage('Você já tem 3 músicas na fila, por favor espere a próxima música');
          setShowPopup(true);
        }

        if (addMusic?.status === 409) {
          handleCloseModal();
          setPopupMessage('essa mnúsica já está na fila, por favor escolha outra');
          setShowPopup(true);
        }
          
      } catch (error) {
        console.error(error);
      } finally {
        setIsAddingTrack(false);
      }
    }
  }

  const handleConfirm = () => {
    handleConfirmAddTrack();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrack(null);
  }

  const handleClosePopup = () => {
    setShowRankChangePopup(false);
  };

  const memoizedSearchResults = useMemo(() => searchResults, [searchResults]);
  const memoizedTopTracksInBrazil = useMemo(() => topTracksInBrazil, [topTracksInBrazil]);

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
        <Container style={{ position: 'relative' }}>
            <Header dj={dj} isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen}/>
            <Row>
              <Col md={3} className="d-none d-xxl-block">
                <Menu dj={dj} />
              </Col>
              <Col className="py-4" md={12} lg={12} xl={12} xxl={9}>
                <Card className="text-center text-light" style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}>
                  <Card.Body
                    className="hide-scrollbar"
                    style={{ width: '100%', height: '845px', overflowY: 'auto', padding: '0px' }}
                  >
                    <Form.Control
                      type="text"
                      placeholder="Pesquisar"
                      value={search}
                      onChange={handleChange}
                      className="my-3 search-input"
                      style={{ 
                        textAlign: 'center', 
                        position: 'sticky',
                        top: '0px',
                        zIndex: 1000,
                        backgroundColor: '#000000',
                        color: 'white'
                      }}
                    />
                    {isDebouncing ? (
                      <div className="d-flex justify-content-center align-items-center my-4">
                        <Spinner animation="border" className="text-light" />
                      </div>
                    ) : memoizedSearchResults.length > 0 ? (
                      <>
                        <h1>Resultados da busca:</h1>
                        <Row style={{ width: '100%' }}>
                          {memoizedSearchResults.map((track: Music, index) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                              <Card
                                className="image-col text-light"
                                style={{ cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', marginLeft: '5%' }}
                                onClick={() => handleClick(track)}
                              >
                                <Card.Img variant="top" src={track.album.images[0].url} />
                                <Card.Body>
                                  <Card.Title>{track.name}</Card.Title>
                                  <Card.Text>
                                    {track.artists.map((artist) => artist.name).join(', ')}
                                  </Card.Text>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                        {isDebouncing && (
                          <div className="d-flex justify-content-center align-items-center my-4">
                            <Spinner animation="border" className="text-light" />
                          </div>
                        )}
                      </>
                    ) : (
                      !isDebouncing && (
                        <>
                          <h1>Populares no Brasil:</h1>
                          <Row style={{ width: '100%' }}>
                            {memoizedTopTracksInBrazil.map((track: Music, index) => (
                              <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card
                                  className="image-col text-light"
                                  style={{ cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', marginLeft: '5%' }}
                                  onClick={() => handleClick(track)}
                                >
                                  <Card.Img variant="top" src={track.album.images[0].url} />
                                  <Card.Body>
                                    <Card.Title>{track.name}</Card.Title>
                                    <Card.Text>
                                      {track.artists.map((artist) => artist.name).join(', ')}
                                    </Card.Text>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </>
                      )
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          <Modal className='custom-modal' show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton style={{ borderBottom: 'none' }}>
              <Modal.Title>Confirmação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {isAddingTrack ? (
                <div className="d-flex justify-content-center align-items-center">
                  <Spinner animation="border" className="text-light" />
                </div>
              ) : (
                <div>
                  <p>{`Deseja adicionar a música "${selectedTrack?.name}" à fila?`}</p>
                  {selectedTrack?.preview_url ? (
                    <div className="audio-preview">
                      <audio controls>
                        <source src={selectedTrack.preview_url} type="audio/mpeg" />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>
                    </div>
                  ) : (
                    <div>
                      <p style={{color: 'red'}}>Prévia não disponível para esta faixa.</p>
                      <Button
                        className='menu-button-spotify'
                        href={`https://open.spotify.com/track/${selectedTrack?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ouvir no Spotify
                      </Button>
                      <OverlayTrigger
                        placement="bottom-start"
                        overlay={
                          <Tooltip>
                            Normalmente oferecemos uma prévia da música para você confirmar se 
                            é a que deseja adicionar à fila, mas este recurso não está disponível no momento. 
                            Clique no botão para ouvi-la diretamente no Spotify!
                          </Tooltip>
                        }
                      >
                        <span className='ms-2'>
                          <FaQuestionCircle style={{ cursor: 'pointer', color: '#ffffff' }} />
                        </span>
                      </OverlayTrigger>
                    </div>
                  )}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ borderTop: 'none' }}>
              {!isAddingTrack && (
                <>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleConfirm}>
                    Confirmar
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Modal>
          {showVotePopup && (
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
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token,
});

const AddMusicToQueueConnected = connect(mapStateToProps)(AddMusicToQueue);

export default AddMusicToQueueConnected;