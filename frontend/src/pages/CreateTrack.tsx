import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { saveTrack } from '../redux/actions';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { logo } from '../teste_avatares/characterPath';
import useTrack from '../utils/useTrack';

interface Props {
  code: string;
  token: string;
}

const CreateTrack: React.FC<Props> = ({ code, token }) => {
  const [trackName, setTrackName] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const navigate = useNavigate();
  const trackActions = useTrack();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (!code) {
        setModalMessage('Erro ao tentar conectar a sua conta do Spotify, faça login novamente');
        setShowModal(true);
        return;
      }
      const response = await trackActions.verifyIfTrackAlreadyBeenCreated(token);
      if (response?.status === 200) {
        navigate(`/track-info/${response.data}`);
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code, trackName, token, trackActions, navigate]);

  const inputValidation = () => {
    if (trackName.length >= 3 && trackName.length <= 16) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTrackName(value);
    inputValidation();
  };

  const handleClick = async () => {
    if (trackName && code) {
      const track = await trackActions.createTrack({ trackName, code });
      if (track?.status === 201) {
        dispatch(saveTrack(track.data.token));
        navigate(`/track-info/${track.data.id}`);
      } else if (track?.status === 401) {
        setUnauthorizedMessage(true);
      } else {
        setModalMessage('Algo deu errado ao tentar criar a pista, tente novamente');
        setShowModal(true);
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    isLoading ? (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <h1 className='text-light'>Carregando</h1>
        <Spinner animation="border" className='text-light'/>
      </Container>
    ) : (
      <Container className="d-flex align-items-center justify-content-center vh-100">
        <Row className="justify-content-center d-flex flex-column">
          <Col xs={12} md={8} lg={11} className="text-center mb-5">
            <img 
              src={logo} 
              alt='logo' 
              className='img-fluid rounded-circle shadow-lg mb-5' 
              style={{ maxWidth: '300px' }} 
            />
            <Form.Group className="mb-3" style={{ maxWidth: '500px' }}>
              <Form.Control
                type="text"
                placeholder="Nome da Pista"
                value={trackName}
                onChange={handleChange}
                style={{ height: '50px', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}
              />
              <Button
                variant="primary"
                disabled={ buttonDisabled }
                onClick={ handleClick } 
                style={{ height: '50px', fontSize: '1.2rem', marginTop: '10px', width: '100%' }}
              >
                Criar
              </Button>
              {unauthorizedMessage && (
                <div className="text-danger mt-2">
                  Sua conta do Spotify precisa ser premium para criar uma pista.
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Oops...</Modal.Title>
          </Modal.Header>
          <Modal.Body className='text-center'>{modalMessage}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    )
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.trackReducer.token
});

const CreateTrackConnected = connect(mapStateToProps)(CreateTrack);

export default CreateTrackConnected;
