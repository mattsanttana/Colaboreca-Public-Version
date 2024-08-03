import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Form, Card, Modal } from 'react-bootstrap';
import { RootState } from '../redux/store';
import { connect } from 'react-redux';
import { charactersPaths } from '../teste_avatares/characterPath';
import useDJ from '../utils/useDJ';
import DJ from '../types/DJ';
import Menu from './Menu';
import Header from './Header';
import MessagePopup from './MessagePopup';

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

  const djActions = useDJ();
  const navigate = useNavigate();
  const intervalId1 = useRef<NodeJS.Timeout | null>(null);
  const avatarRef = useRef<HTMLImageElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const pageType = window.location.pathname.split('/')[1];
      if (pageType !== 'track-info') {
        setIsTrackOwner(false);
      }

      const menuDJ = await djActions.getDJByToken(token);
      if (menuDJ) {
        setMenuDJ(menuDJ);
      }

      if (djId && trackId) {
        const [fetchedDJ, verifyIfDJisOwner] = await Promise.all([
          djActions.getDJById(djId, trackId),
          djActions.verifyIfTheDJIsTheProfileOwner(djId, token),
        ]);

        if (fetchedDJ?.status === 200) {
          setDJ(fetchedDJ.data);
          if (verifyIfDJisOwner) {
            setIsOwner(verifyIfDJisOwner);
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  }, [djActions, token, djId, trackId]);

  useEffect(() => {
    fetchData();

    intervalId1.current = setInterval(fetchData, 5000);

    return () => {
      if (intervalId1.current) clearInterval(intervalId1.current);
    };
  }, [fetchData]);

  useEffect(() => {
    if (editedCharacterPath === '' && editedName === '' && dj) {
      setEditedCharacterPath(dj?.characterPath || '');
      setEditedName(dj?.djName || '');
    }
  }, [dj, editedCharacterPath, editedName]);

  useEffect(() => {
    const isSameAsDJ = editedCharacterPath === dj?.characterPath && editedName === dj?.djName;
    const isNameTooShort = editedName.length < 3;
    const isNameTooBig = editedName.length > 16;
    setIsButtonDisabled(isSameAsDJ || isNameTooShort || isNameTooBig);
  }, [editedCharacterPath, editedName, dj]);

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
      setPopupMessage('Algo deu errado, por favor tente novamente em alguns minutos');
      setShowMessagePopup(true);
      return;
    }
  
    const response = await djActions.deleteDJ(token);
  
    if (response?.status === 200) {
      navigate('/');
    } else {
      setPopupMessage('Algo deu errado, por favor tente novamente em alguns minutos');
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
          <Modal show={showPopup} onHide={handleClosePopup}>
            <Modal.Header closeButton>
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
                  <img src={editedCharacterPath} alt={editedName} className="mb-3" style={{ width: '200px', borderRadius: '50%' }} />
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
                    className="text-center"
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
          <Modal show={showAvatarPopup} onHide={handleCloseAvatarPopup}>
            <Modal.Header closeButton>
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
          <Modal show={showDeleteConfirmPopup} onHide={cancelDeleteDJ}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmação de Exclusão</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Você tem certeza que quer excluir este DJ?
            </Modal.Body>
            <Modal.Footer>
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
            <Col md={9}>
              <Card className="text-center">
                <Card.Img
                  variant="top"
                  src={dj.characterPath}
                  className="img-fluid rounded-circle mb-3"
                  style={{ width: '300px', margin: '0 auto' }}
                />
                <Card.Body>
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <div className="rank-square">{dj?.ranking || '-'}</div>
                    <div className="name-square mx-3">{dj?.djName}</div>
                    <div className="points-square">{dj?.score} pts</div>
                  </div>
                  {isOwner && !isTrackOwner && (
                    <Button variant="primary" onClick={() => setShowPopup(true)}>
                      Editar/Excluir DJ
                    </Button>
                  )}
                </Card.Body>
              </Card>
              <Card className="mt-4">
                <Card.Body>
                  <Card.Title>Músicas Tocadas</Card.Title>
                  <Card.Text>Aqui vai ficar a lista de músicas já tocadas por esse DJ</Card.Text>
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
      <MessagePopup show={showMessagePopup} handleClose={() => setShowMessagePopup(false)} message={popupMessage}/>
    </Container>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token,
});

const DJProfileConnected = connect(mapStateToProps)(DJProfile);

export default DJProfileConnected;
