import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, Modal, Table } from 'react-bootstrap';
import { io } from 'socket.io-client';
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
import RankingChangePopup from './RankingChangePopup';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const TrackInfoMenu = lazy(() => import('./TrackInfoMenu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  djToken: string;
  trackToken: string;
}

const socket = io('http://localhost:3001');

const DJProfile: React.FC<Props> = ({ djToken, trackToken }) => {
  const { trackId, djId } = useParams();
  const [menuDJ, setMenuDJ] = useState<DJ>();
  const [dj, setDJ] = useState<DJ>();
  const [djs, setDJs] = useState<DJ[]>([]);
  const [previewRank, setPreviewRank] = useState<DJ[]>([]);
  const [showRankChangePopup, setShowRankChangePopup] = useState(false);
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
  const interval = useRef<number | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (trackId) {
        const pageType = window.location.pathname.split('/')[1];
    
        if (pageType !== 'track-info') {
          setIsTrackOwner(false);

          const [ fetchedTrack, fetchedDJData, fetchedDJ, fetchedVerifyIfDJIsOwner ] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.getDJData(djToken),
            djActions.getDJById(djId, trackId),
            djActions.verifyIfTheDJIsTheProfileOwner(djId, djToken)
          ]);

          if (!fetchedDJData?.data.dj) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedTrack?.status === 200) {
            setMenuDJ(fetchedDJData?.data.dj);
            setDJ(fetchedDJ?.data);
            setIsOwner(fetchedVerifyIfDJIsOwner);
          } else {
            setPopupMessage('Esta pista não existe');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }
        } else {
          setIsTrackOwner(true);

          if (trackId) {
            const [ fetchedTrack, fetchedVerifyTrackAcess ] = await Promise.all([
              trackActions.getTrackById(trackId),
              trackActions.verifyTrackAcess(trackToken, trackId)
            ])

            if (fetchedTrack?.status !== 200) {
              setPopupMessage('Esta pista não existe');
              setRedirectTo('/enter-track');
              setShowPopup(true);
            }

            if (fetchedVerifyTrackAcess?.status !== 200) {
              setPopupMessage('Você não tem permissão para acessar essa pista');
              setRedirectTo('/login');
              setShowPopup(true);
            }
          }
        }
      }
    };

    fetchInitialData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (trackId && playingNow) {

        // Limpar os votos quando a URI da música atual mudar
        setDJPlayingNow(null);

        try {
          const [fetchedVerifyIfDJHasAlreadVoted, fetchedDJPlayingNow, fetchedAddedMusicByDJ] = await Promise.all([
            voteActions.verifyIfDJHasAlreadVoted(djToken),
            playbackActions.getDJAddedCurrentMusic(trackId),
            playbackActions.getAddedMusicsByDJ(djId, trackId)
          ]);

          setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
          setDJPlayingNow(fetchedDJPlayingNow);
          setMusics(fetchedAddedMusicByDJ);
    
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
    if (socket.connected && menuDJ) {
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
      if (Number(menuDJ) === Number(data.djId)) {
        setPopupMessage('Você foi removido desta pista');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      }

      const redirect = isTrackOwner ? `/track-info/${trackId}` : `/track/${trackId}`;

      if (Number(dj?.id) === Number(data.djId)) {
        setPopupMessage('Este DJ foi deletado');
        setRedirectTo(redirect);
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
  }, [menuDJ]);

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
                    className="text-centert"
                    onKeyDown={handleKeyPress}
                    style={{ backgroundColor: 'black', color: 'white', border: '1px solid white', textAlign: 'center' }}
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
              <Col md={3} className="d-none d-xxl-block">
                <TrackInfoMenu trackId={trackId} />
              </Col>
            ) : (
              <Col md={3} className="d-none d-xxl-block">
                <Menu dj={menuDJ} />
              </Col>
            )}
            <Col className="py-4" md={12} lg={12} xl={12} xxl={9}>
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
                <div className="d-flex justify-content-center align-items-center mb-3">
                <div className={`rank-square ${dj?.ranking === 1 ? 'gold' : dj?.ranking === 2 ? 'silver' : dj?.ranking === 3 ? 'bronze' : ''}`}>
                    {dj?.ranking ? `${dj.ranking}º` : '-'}
                  </div>
                    <div className="name-square mx-3">{dj?.djName}</div>
                    <div className="points-square">{dj?.score} pts</div>
                  </div>
                  {isOwner && !isTrackOwner && (
                    <Button variant="primary" style={{marginLeft: '25%', width: '50%', marginTop: '10px'}} onClick={() => setShowPopup(true)}>
                      Editar/Excluir DJ
                    </Button>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px' }}>
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
                <Card.Body style={{height: '36vh', overflow: 'auto'}}>
                  <Card.Title className="mt-4 text-light" style={{ margin: '10px' }}>Músicas adicionadas:</Card.Title>
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
