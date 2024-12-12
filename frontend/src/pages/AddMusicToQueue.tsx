import React, { useCallback, useEffect, useRef, useState, lazy, useMemo } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../redux/store';
import { Card, Col, Container, Form, Row, Spinner, Modal, Button } from 'react-bootstrap';
import MessagePopup from './MessagePopup';
import useDebounce from '../utils/useDebounce';
import usePlayback from '../utils/usePlayback';
import useDJ from '../utils/useDJ';
import useVote from '../utils/useVote';
import { Music } from '../types/SpotifySearchResponse';
import { DJ, DJPlayingNow } from '../types/DJ';
import PlayingNow from '../types/PlayingNow';
import { logo } from '../assets/images/characterPath';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  token: string;
}

const AddMusicToQueue: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [dj, setDJ] = useState<DJ>();
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

  const playbackActions = usePlayback();
  const djActions = useDJ();
  const voteActions = useVote();
  const debouncedSearch = useDebounce(search, 600);
  const menuRef = useRef<HTMLDivElement>(null);
  const interval = useRef<NodeJS.Timeout | null>(null);

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

  // useEffect para carregar os dados periodicamente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          fetchedVerifyLogin,
          fetchedDJ,
          fetchedPlayingNow,
          fetchedDJPlayingNow,
          fetchedVerifyIfDJHasAlreadVoted
        ] = await Promise.all([
          djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(token),
          djActions.getDJByToken(token),
          playbackActions.getState(trackId as string),
          playbackActions.getDJAddedCurrentMusic(trackId),
          voteActions.verifyIfDJHasAlreadVoted(token)
        ]);

        if (fetchedVerifyLogin?.status !== 200) {
          setPopupMessage('Você não está logado, por favor faça login novamente');
          setRedirectTo('/enter-track');
          setShowPopup(true);
          return;
        }
      
        if (fetchedDJ?.status !== 200) {
          setPopupMessage('Você não é um DJ desta pista, por favor faça login');
          setRedirectTo('/enter-track');
          setShowPopup(true);
          return;
        }

        if (fetchedDJ?.status === 200) {
          setDJ(fetchedDJ.data);
          setPlayingNow(fetchedPlayingNow);
          setDJPlayingNow(fetchedDJPlayingNow);
          setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
        } else {
          console.error('Error fetching DJ');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    interval.current = setInterval(() => {
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
                        <Row>
                          {memoizedSearchResults.map((track: Music, index) => (
                            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                              <Card
                                className="image-col text-light"
                                style={{ cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
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
                          <Row>
                            {memoizedTopTracksInBrazil.map((track: Music, index) => (
                              <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                <Card
                                  className="image-col text-light"
                                  style={{ cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
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