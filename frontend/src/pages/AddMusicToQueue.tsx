import React, { useCallback, useEffect, useRef, useState, lazy, useMemo } from 'react';
import { Card, Col, Container, Form, Row, Spinner, Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RootState } from '../redux/store';
import { Music } from '../types/SpotifySearchResponse';
import { useParams } from 'react-router-dom';
import useDebounce from '../utils/useDebounce';
import { DJ, DJPlayingNow } from '../types/DJ';
import usePlayback from '../utils/usePlayback';
import useDJ from '../utils/useDJ';
import useVote from '../utils/useVote';
import MessagePopup from './MessagePopup';
import PlayingNow from '../types/PlayingNow';
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
  const [modalMessage, setModalMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          fetchedVerifyLogin,
          fetchedDJ,
          fetchedGetTopTracksInBrazil,
          fetchedPlayingNow,
          fetchedDJPlayingNow,
          fetchedVerifyIfDJHasAlreadVoted
        ] = await Promise.all([
          djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(token),
          djActions.getDJByToken(token),
          playbackActions.getTopMusicsInBrazil(trackId),
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

        if (fetchedGetTopTracksInBrazil?.status === 200) {
          setTopTracksInBrazil(fetchedGetTopTracksInBrazil.data);
        } else {
          console.error('Error fetching top tracks in Brazil');
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
    }, 5000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };

  }, [djActions, playbackActions, token, trackId, voteActions]);

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
      setModalMessage('');
      try {
        const response = await playbackActions.addTrackToQueue(
          trackId,
          selectedTrack.album.images[0].url,
          selectedTrack.name,
          selectedTrack.artists.map((artist) => artist.name).join(', '),
          selectedTrack.uri,
          token
        );
        if (response?.status === 409) {
          setModalMessage('Essa música já está na fila, por favor adicione outra.');
        } else if (response?.status === 401) {
          setModalMessage('Token inválido, por favor faça login novamente.');
        } else if (response?.status === 404) {
          setModalMessage('Falha ao tentar adicionar a música à fila, nenhum dispositivo ativo encontrado.');
        } else {
          setModalMessage('Música adicionada à fila com sucesso!');
        }
      } catch (error) {
        console.error(error);
        setModalMessage('Ocorreu um erro ao adicionar a música à fila.');
      } finally {
        setIsAddingTrack(false);
      }
    }
  }

  const handleConfirm = () => {
    setIsConfirmed(true);
    handleConfirmAddTrack();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrack(null);
    setIsConfirmed(false);
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
          <h1 className="text-light">Carregando</h1>
          <Spinner animation="border" className="text-light" />
        </Container>
      ) : (
        <Container style={{ position: 'relative' }}>
            <Header dj={dj} isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen}/>
            <Row>
              <Col md={3} className="d-none d-xl-block">
                <Menu dj={dj} />
              </Col>
              <Col className="py-4" md={12} lg={12} xl={9}>
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
                      className="my-3 custom-input"
                      style={{ 
                        textAlign: 'center', 
                        position: 'sticky',
                        top: '0px',
                        zIndex: 1000,
                        backgroundColor: '#000000'
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
                  <Spinner animation="border" className="text-dark" />
                  <span className="ml-3">Adicionando à fila...</span>
                </div>
              ) : (
                <div>
                  <p>{modalMessage || `Deseja adicionar a música "${selectedTrack?.name}" à fila?`}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ borderTop: 'none' }}>
              {!isAddingTrack && !isConfirmed && (
                <>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleConfirm}>
                    Confirmar
                  </Button>
                </>
              )}
              {isConfirmed && (
                <Button variant="primary" onClick={handleCloseModal}>
                  Fechar
                </Button>
              )}
            </Modal.Footer>
          </Modal>
          {showVotePopup && (
            <VotePopup
              showVotePopup={showVotePopup}
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