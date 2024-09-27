import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Form, Card, Modal, Table } from 'react-bootstrap';
import { RootState } from '../redux/store';
import { connect } from 'react-redux';
import { charactersPaths } from '../assets/images/characterPath';
import useDJ from '../utils/useDJ';
import usePlayback from '../utils/usePlayback';
import { DJ } from '../types/DJ';
import Menu from './Menu';
import Header from './Header';
import MessagePopup from './MessagePopup';
import { DJMusic } from '../types/SpotifySearchResponse';

interface Props {
  token: string;
}

const DJProfile: React.FC<Props> = ({ token }) => {
  const { trackId, djId } = useParams();
  const [menuDJ, setMenuDJ] = useState<DJ>();
  const [dj, setDJ] = useState<DJ>();
  const [isOwner, setIsOwner] = useState(false);
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
  const [popupMessage, setPopupMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [musics, setMusics] = useState<DJMusic[]>([]);
  const [filter, setFilter] = useState<string>('1');

  const djActions = useDJ();
  const playbackActions = usePlayback();
  const navigate = useNavigate();
  const avatarRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const pageType = window.location.pathname.split('/')[1];
    const isSameAsDJ = editedCharacterPath === dj?.characterPath && editedName === dj?.djName;
    const isNameTooShort = editedName.length < 3;
    const isNameTooBig = editedName.length > 16;

    setIsButtonDisabled(isSameAsDJ || isNameTooShort || isNameTooBig);
  
    if (pageType !== 'track-info') {
      setIsTrackOwner(false);
    }

    if (editedCharacterPath === '' && editedName === '' && dj) {
      setEditedCharacterPath(dj?.characterPath || '');
      setEditedName(dj?.djName || '');
    }
  }, [dj, editedCharacterPath, editedName]);

  useEffect(() => {
    const fetchData = async () => {
      if (djId && trackId) {
        try {
          const [fetchVerifyLogin, fetchedMenuDJ, fetchedDJ, fetchedVerifyIfDJIsOwner, fetchedAddedMusicByDJ] = await Promise.all([
            djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(token),
            djActions.getDJByToken(token),
            djActions.getDJById(djId, trackId),
            djActions.verifyIfTheDJIsTheProfileOwner(djId, token),
            playbackActions.getAddedMusicsByDJ(djId, trackId),
          ]);

          if (fetchVerifyLogin?.status !== 200) {
            setPopupMessage('Você não está logado, por favor faça login novamente');
            setRedirectTo('/enter-track');
            setShowMessagePopup(true);
        }
        
        if (fetchedDJ?.status !== 200) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowMessagePopup(true);
        }

          if (fetchedMenuDJ?.status === 200) {
            setMenuDJ(fetchedMenuDJ.data);
          }

          if (fetchedDJ?.status === 200) {
            setDJ(fetchedDJ.data);
        }
  
          if (fetchedVerifyIfDJIsOwner) {
            setIsOwner(fetchedVerifyIfDJIsOwner);
          }
  
          if (fetchedAddedMusicByDJ) {
            setMusics(fetchedAddedMusicByDJ);
        }
  
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchData();

  }, [djActions, djId, playbackActions, token, trackId]);    

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

    const response = await djActions.updateDJ(editedName, editedCharacterPath, token);

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
  
    const response = await djActions.deleteDJ(token);
  
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
    <Container>
      {isLoading ? (
        <Row className="justify-content-center">
          <Col xs={12} className="text-center">
            <Spinner animation="border" />
            <h1>Carregando...</h1>
          </Col>
        </Row>
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
          <Header />
          <Row>
            {!isTrackOwner && (
              <Col md={3}>
                <Menu dj={menuDJ} />
              </Col>
            )}
            <Col className="py-4" md={9}>
              <Card
                className="text-center"
                style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
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
                  <Card.Title className="mt-4, text-light" style={{margin: '10px'}}>Músicas adicionadas:</Card.Title>
                    <Form.Select
                      className='text-light'
                      style={{backgroundColor: '#000000', width: '140px', float: 'right'}}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="1">Todas</option>
                      <option value="2">Tocadas</option>
                      <option value="3">Não tocadas</option>
                    </Form.Select>
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
  token: state.djReducer.token,
});

const DJProfileConnected = connect(mapStateToProps)(DJProfile);

export default DJProfileConnected;
