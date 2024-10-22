import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, Modal, Table } from 'react-bootstrap';
import { RootState } from '../redux/store';
import { connect } from 'react-redux';
import MessagePopup from './MessagePopup';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import useVote from '../utils/useVote';
import usePlayback from '../utils/usePlayback';
import { DJ, DJPlayingNow } from '../types/DJ';
import { DJMusic } from '../types/SpotifySearchResponse';
import { charactersPaths, logo } from '../assets/images/characterPath';
import PlayingNow from '../types/PlayingNow';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const TrackInfoMenu = lazy(() => import('./TrackInfoMenu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  djToken: string;
  trackToken: string;
}

const DJProfile: React.FC<Props> = ({ djToken, trackToken }) => {
  const { trackId, djId } = useParams();
  const [menuDJ, setMenuDJ] = useState<DJ>();
  const [dj, setDJ] = useState<DJ>();
  const [isOwner, setIsOwner] = useState<boolean | undefined>(false);
  const [isTrackOwner, setIsTrackOwner] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editedCharacterPath, setEditedCharacterPath] = useState<string>('');
  const [editedName, setEditedName] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [showVotePopup, setShowVotePopup] = useState<boolean | undefined>(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [musics, setMusics] = useState<DJMusic[]>([]);
  const [filter, setFilter] = useState<string>('1');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);

  const djActions = useDJ();
  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const voteActions = useVote();
  const navigate = useNavigate();
  const avatarRef = useRef<HTMLImageElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<{ [key: string]: { dj: DJ, isOwner: boolean, musics: DJMusic[] } }>({});
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const pageType = window.location.pathname.split('/')[1];
  
      if (pageType !== 'track-info') {
        setIsTrackOwner(false);

        const [fetchVerifyLogin, fetchedMenuDJ] = await Promise.all([
          djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(djToken),
          djActions.getDJByToken(djToken),
        ]);

        if (fetchVerifyLogin?.status !== 200 || fetchedMenuDJ?.status !== 200) {
          setPopupMessage('Você não é um DJ desta pista, por favor faça login novamente');
          setRedirectTo('/enter-track');
          setShowMessagePopup(true);
        } else {
          setMenuDJ(fetchedMenuDJ.data);
        }
      } else {
        setIsTrackOwner(true);

        if (trackId) {
          const verifyOwnerLogin = await trackActions.verifyTrackAcess(trackToken, trackId);

          if (verifyOwnerLogin?.status === 401) {
            setPopupMessage('Você não tem permissão para acessar essa pista');
            setRedirectTo('/login');
            setShowMessagePopup(true);
          }
        }
      }
    };

    fetchInitialData();
  }, [djActions, djToken, trackActions, trackId, trackToken]);

  useEffect(() => {
    const isSameAsDJ = editedCharacterPath === dj?.characterPath && editedName === dj?.djName;
    const isNameTooShort = editedName.length < 3;
    const isNameTooBig = editedName.length > 16;

    setIsButtonDisabled(isSameAsDJ || isNameTooShort || isNameTooBig);

    if (editedCharacterPath === '' && editedName === '' && dj) {
      setEditedCharacterPath(dj?.characterPath || '');
      setEditedName(dj?.djName || '');
    }
  }
  , [dj, editedCharacterPath, editedName]);

  useEffect(() => {
    const fetchData = async () => {
      if (djId && trackId) {
        const cacheKey = `dj_${djId}_track_${trackId}`;
        if (cacheRef.current[cacheKey]) {
          const cachedData = cacheRef.current[cacheKey];
          setDJ(cachedData.dj);
          setIsOwner(cachedData.isOwner);
          setMusics(cachedData.musics);
          setIsLoading(false);
          return;
        }

        try {
          const [
            fetchedDJ,
            fetchedVerifyIfDJIsOwner,
            fetchedAddedMusicByDJ,
            fetchedPlayingNow,
            fetchedDJPlayingNow,
            fetchedVerifyIfDJHasAlreadVoted
          ] = await Promise.all([
            djActions.getDJById(djId, trackId),
            djActions.verifyIfTheDJIsTheProfileOwner(djId, djToken),
            playbackActions.getAddedMusicsByDJ(djId, trackId),
            playbackActions.getState(trackId),
            playbackActions.getDJAddedCurrentMusic(trackId),
            voteActions.verifyIfDJHasAlreadVoted(djToken)
          ]);

          if (fetchedDJ?.status === 200) {
            const data = {
              dj: fetchedDJ.data,
              isOwner: fetchedVerifyIfDJIsOwner || false,
              musics: fetchedAddedMusicByDJ,
            };
            cacheRef.current[cacheKey] = data; // Cache the result
            setDJ(data.dj);
            setIsOwner(data.isOwner);
            setMusics(data.musics);
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
      clearInterval(interval.current as NodeJS.Timeout);
    };
  }, [djId, trackId, djToken, djActions, playbackActions, voteActions]);

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

  const playedMusics = musics.filter((music) => music.wasPlayed);
  const notPlayedMusics = musics.filter((music) => !music.wasPlayed);

  const handleClickCharacter = (event: React.MouseEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    setEditedCharacterPath(target.src);
    setShowAvatarPopup(false);
  };

  const handleSaveChanges = async () => {
    if (!editedName || !editedCharacterPath) {
      setPopupMessage('Por favor, preencha todos os campos.');
      setShowMessagePopup(true);
      return;
    }

    const response = await djActions.updateDJ(editedName, editedCharacterPath, djToken);

    if (response?.status === 200) {
      setShowPopup(false);
      setIsLoading(true);
      window.location.reload();
    } else if (response?.status === 400) {
      setPopupMessage('Este vulgo já existe');
      setShowMessagePopup(true);
    } else {
      setPopupMessage('Algo deu errado, por favor tente novamente em alguns minutos');
      setShowMessagePopup(true);
    }
  };

  const handleDeleteDJ = () => {
    setShowDeleteConfirmPopup(true);
  };
  
  const confirmDeleteDJ = async () => {
    if (!djId) {
      setPopupMessage('Algo deu errado, por favor tente novamente em alguns estantes');
      setShowMessagePopup(true);
      return;
    }
  
    const response = await djActions.deleteDJ(djToken);
  
    if (response?.status === 200) {
      navigate('/');
    } else {
      setPopupMessage('Algo deu errado, por favor tente novamente em alguns estantes');
      setShowMessagePopup(true);
    }
    setShowDeleteConfirmPopup(false);
  };
  
  const cancelDeleteDJ = () => {
    setShowDeleteConfirmPopup(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowAvatarPopup(false);
    setEditedCharacterPath(dj?.characterPath || '');
    setEditedName(dj?.djName || '');
  };

  const handleShowAvatarPopup = () => {
    setShowAvatarPopup(true);
  };

  const handleCloseAvatarPopup = () => {
    setShowAvatarPopup(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !isButtonDisabled) {
      handleSaveChanges();
    }
  };

  return (
    <Container
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      {isLoading ? (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <img src={logo} alt="Loading Logo" className="logo-spinner" />
        </Container>
      ) : dj ? (
        <div>
          <Modal className="custom-modal" show={showPopup} onHide={handleClosePopup}>
            <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
              <Modal.Title>Editar DJ</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center" onKeyDown={handleKeyPress}>
              <Form>
                <div
                  ref={avatarRef}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={handleShowAvatarPopup}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  <img
                    src={editedCharacterPath}
                    alt={editedName}
                    className="mb-3"
                    style={{ width: '200px', borderRadius: '50%' }}
                  />
                  {showTooltip && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                      }}
                    >
                      Alterar Avatar
                    </div>
                  )}
                </div>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-center custom-input"
                    onKeyDown={handleKeyPress}
                  />
                </Form.Group>
                <Button variant="primary" disabled={isButtonDisabled} onClick={handleSaveChanges}>
                  Salvar
                </Button>
                <Button variant="danger" onClick={handleDeleteDJ}>
                  Excluir DJ
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          <Modal className="custom-modal" show={showAvatarPopup} onHide={handleCloseAvatarPopup}>
            <Modal.Header closeButton className="custom-modal-header" style={{ borderBottom: 'none' }}>
              <Modal.Title>Escolha seu avatar</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <div className="d-flex justify-content-center flex-wrap">
                {charactersPaths.map((character, index) => (
                  <img
                    key={index}
                    src={character}
                    alt="Avatar"
                    onClick={handleClickCharacter}
                    style={{ cursor: 'pointer', margin: '10px', width: '50px', height: '50px' }}
                  />
                ))}
              </div>
            </Modal.Body>
          </Modal>
          <Modal className='custom-modal' show={showDeleteConfirmPopup} onHide={cancelDeleteDJ}>
            <Modal.Header closeButton className='custom-modal-header' style={{ borderBottom: 'none' }}>
              <Modal.Title>Confirmação de Exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Você tem certeza que quer excluir este DJ?
            </Modal.Body>
            <Modal.Footer style={{ borderTop: 'none' }}>
              <Button variant="secondary" onClick={cancelDeleteDJ}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDeleteDJ}>
                Excluir
              </Button>
            </Modal.Footer>
          </Modal>
          <Header dj={dj} isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen}/>
          <Row>
            {isTrackOwner ? (
              <Col md={3} className="d-none d-xl-block">
                <TrackInfoMenu trackId={trackId} />
              </Col>
            ) : (
              <Col md={3} className="d-none d-xl-block">
                <Menu dj={menuDJ} />
              </Col>
            )}
            <Col className="py-4" md={12} lg={12} xl={9}>
              <Card
                className="text-center"
                style={{ backgroundColor: '#000000', padding: '0' }}
              >
                <Card.Img
                  variant="top"
                  src={dj.characterPath}
                  className="img-fluid rounded-circle mb-3"
                  style={{ width: '300px', margin: '0 auto' }}
                />
                <Card.Body style={{height: '530px', overflow: 'auto'}}>
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <div className="rank-square">{dj?.ranking || '-'}</div>
                    <div className="name-square mx-3">{dj?.djName}</div>
                    <div className="points-square">{dj?.score} pts</div>
                  </div>
                  {isOwner && !isTrackOwner && (
                    <Button variant="primary" style={{margin: '10px'}} onClick={() => setShowPopup(true)}>
                      Editar/Excluir DJ
                    </Button>
                  )}
                  <Card.Title className="mt-4 text-light" style={{ margin: '10px' }}>Músicas adicionadas:</Card.Title>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Form.Select
                        className='text-light'
                        style={{ backgroundColor: '#000000', width: '140px' }}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="1">Todas</option>
                        <option value="2">Tocadas</option>
                        <option value="3">Não tocadas</option>
                      </Form.Select>
                    </div>
                    {musics.length > 0 ? (
                      <div className='table-responsive'>
                        <Table striped className='text-light'>
                          <thead>
                            <tr>
                              <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Música</th>
                              <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Artista</th>
                              <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Capa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filter === '1' ? (
                              musics.map((music, index) => (
                                <tr key={index}>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.name}</td>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.artists}</td>
                                  <td style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                                    <img
                                      src={music.cover}
                                      alt={music.name}
                                      className='img-thumbnail'
                                      style={{ width: '60px', height: '60px', backgroundColor: '#000000' }}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : filter === '2' ? (
                              playedMusics.map((music, index) => (
                                <tr key={index}>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.name}</td>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.artists}</td>
                                  <td style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                                    <img
                                      src={music.cover}
                                      alt={music.name}
                                      className='img-thumbnail'
                                      style={{ width: '60px', height: '60px', backgroundColor: '#000000' }}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              notPlayedMusics.map((music, index) => (
                                <tr key={index}>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.name}</td>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.artists}</td>
                                  <td style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                                    <img
                                      src={music.cover}
                                      alt={music.name}
                                      className='img-thumbnail'
                                      style={{ width: '60px', height: '60px', backgroundColor: '#000000' }}
                                    />
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                    </div>
                  ) : (
                    <div>
                      <h4 className='text-light' style={{ margin: '100px' }}>Nenhuma música adicionada.</h4>
                    </div>
                  )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {showVotePopup && !isTrackOwner && (
            <VotePopup
              showVotePopup={showVotePopup}
              playingNow={playingNow}
              djPlayingNow={djPlayingNow}
            />
          )}
          </div>
      ) : (
        <Row className="justify-content-center">
          <Col xs={12} className="text-center">
            <h1>DJ não encontrado</h1>
          </Col>
        </Row>
      )}
      <MessagePopup
        show={showMessagePopup}
        handleClose={() => setShowMessagePopup(false)}
        message={popupMessage}
        redirectTo={redirectTo}
      />
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token,
  trackToken: state.trackReducer.token
});

const DJProfileConnected = connect(mapStateToProps)(DJProfile);

export default DJProfileConnected;
