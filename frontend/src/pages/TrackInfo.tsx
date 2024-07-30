import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ShareTrack from './ShareTrack';
import PlaybackState from './PlaybackState';
import Podium from './Podium';
import PlayingNow from '../types/PlayingNow';
import DJ from '../types/DJ';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';
import { RootState } from '../redux/store';
import { Container, Button, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';

interface Props {
  token: string;
}

interface MessagePopupProps {
  show: boolean;
  handleClose: () => void;
  message: string;
  redirectTo?: string;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ show, handleClose, message, redirectTo }) => {
  const navigate = useNavigate();

  const handleClosePopup = () => {
    handleClose();
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  return (
    <Modal show={show} onHide={handleClosePopup}>
      <Modal.Header closeButton>
        <Modal.Title>Mensagem</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClosePopup}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const TrackInfo: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const [trackFound, setTrackFound] = useState<boolean>(false);
  const [trackName, setTrackName] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editedTrackName, setEditedTrackName] = useState<string>('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [djs, setDjs] = useState<DJ[]>([]);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const navigate = useNavigate();
  const intervalId1 = useRef<null | NodeJS.Timeout>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const [
            fetchedOwnerTrack,
            fetchedTrack,
            fetchedDjs,
            fetchedPlayingNow
          ] = await Promise.all([
            trackActions.verifyIfTrackAlreadyBeenCreated(token),
            trackActions.getTrackById(trackId),
            djActions.getAllDJs(trackId),
            playbackActions.getState(trackId)
          ]);
  
          if (fetchedOwnerTrack?.status !== 200) {
            setMessagePopup({
              show: true,
              message: 'Erro ao tentar conectar a sua conta do Spotify, faça login novamente',
              redirectTo: '/login'
            });
          }
  
          if (fetchedTrack?.status === 200) {
            setPlayingNow(fetchedPlayingNow);
            setDjs(fetchedDjs);
            setTrackFound(true);
            setTrackName(fetchedTrack.data.trackName);
            if (!editedTrackName) { // Adicione esta verificação
              setEditedTrackName(fetchedTrack.data.trackName);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    fetchData();
  
    intervalId1.current = setInterval(() => {
      fetchData();
    }, 5000);
  
    return () => {
      if (intervalId1.current) clearInterval(intervalId1.current);
    };
  }, [djActions, editedTrackName, navigate, playbackActions, token, trackActions, trackId]);
  
  useEffect(() => {
    const isSameAsTrack = trackName === editedTrackName;
    const isNameTooShort = editedTrackName.length < 3;
    const isNameTooBig = editedTrackName.length > 16;
    setIsButtonDisabled(isSameAsTrack || isNameTooShort || isNameTooBig);
  }, [trackName, editedTrackName]);
  
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

    const response = await trackActions.updateTrack(editedTrackName, token);

    if (response?.status === 200) {
      setShowPopup(false);
      setTrackName(editedTrackName);
    } else if (response?.status === 400) {
      setMessagePopup({
        show: true,
        message: 'Este vulgo já existe',
        redirectTo: undefined
      });
    } else {
      setMessagePopup({
        show: true,
        message: 'Algo deu errado, por favor tente novamente em alguns minutos',
        redirectTo: undefined
      });
    }
  };

  const handleDeleteTrack = async () => {
    const response = await trackActions.deleteTrack(token);
    if (response?.status === 200) {
      navigate('/');
    } else {
      setMessagePopup({
        show: true,
        message: 'Erro ao tentar excluir a pista, tente novamente em alguns minutos',
        redirectTo: undefined
      });
    }
  };

  return (
    <>
      <MessagePopup
        show={messagePopup.show}
        handleClose={() => setMessagePopup({ ...messagePopup, show: false })}
        message={messagePopup.message}
        redirectTo={messagePopup.redirectTo}
      />
      <Modal show={showPopup} onHide={handleClosePopup}>
        <Modal.Header closeButton>
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
                  value={editedTrackName}
                  onChange={(e) => setEditedTrackName(e.target.value)}
                  className="text-center"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
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
      <Button variant="primary" disabled={isButtonDisabled} onClick={handleSaveChanges} className="me-2">
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
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <h1 className='text-light'>Carregando</h1>
          <Spinner animation="border" className='text-light' />
        </Container>
      ) : trackFound ? (
        <div>
          <Container className="py-4 text-light">
            <h1 className="mb-4">Colaboreca</h1>
            <Row className="mb-4">
              <Col>
                <ShareTrack trackId={trackId} />
              </Col>
            </Row>
            <PlaybackState playingNow={playingNow} isOwner={true} />
            <Podium djs={djs} isOwner={true} trackId={trackId} />
            <Button variant="secondary" onClick={() => setShowPopup(true)}>
                Editar/Excluir Pista
            </Button>
          </Container>
        </div>
      ) : (
        <Container className="d-flex align-items-center justify-content-center vh-100">
          <div className="text-light">
            <h1>Esta pista não existe</h1>
            <Button variant="primary" onClick={() => navigate("/")}>
              Página inicial
            </Button>
          </div>
        </Container>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.trackReducer.token
});

const TrackInfoConnected = connect(mapStateToProps)(TrackInfo);

export default TrackInfoConnected;
