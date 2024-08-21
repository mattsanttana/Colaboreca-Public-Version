import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Form, Row, Col, Image, Spinner, Card } from 'react-bootstrap';
import { saveDJ } from '../redux/actions';
import { RootState } from '../redux/store';
import { charactersPaths } from '../assets/images/characterPath';
import useDJ from '../utils/useDJ';
import MessagePopup from './MessagePopup';

const randomCharacter = charactersPaths[Math.floor(Math.random() * charactersPaths.length)];

interface CreateDJProps {
  token: string;
  trackId: string;
}

const CreateDJ: React.FC<CreateDJProps> = ({ token, trackId }) => {
  const [djData, setDJData] = useState({
    name: '',
    selectedCharacterPath: randomCharacter,
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [phase, setPhase] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>('');

  const djActions = useDJ();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const response = await djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(token);
      if (response?.status === 200) {
        navigate(`/track/${response.data}`);
      }
      setIsLoading(false);
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (djData.name.length >= 3 && djData.name.length <= 16) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [djData.name]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = event.target;
    setDJData(prevState => ({ ...prevState, [inputName]: value }));
  };

  const handleClick = async () => {
    const { name, selectedCharacterPath } = djData;

    if (phase === 1) {
      setPhase(2);
      return;
    }

    if (phase === 2) {
      const dj = await djActions.createDJ({
        djName: name,
        characterPath: selectedCharacterPath,
        trackId
      });

      if (dj && dj.status === 201) {
        dispatch(saveDJ(dj.data.token));
        navigate(`/track/${trackId}`);
      } else if (dj && dj.status === 400) {
        setPopupMessage('Este vulgo já existe');
        setShowPopup(true);
      } else if (dj && dj.status === 401) {
        setPopupMessage('Pista expirada, por favor entre em uma nova pista');
        setShowPopup(true);
      } else {
        setPopupMessage('Algo deu errado, por favor tente novamente em alguns minutos');
        setShowPopup(true);
        navigate('/');
      }
    }
  };

  const handleClickCharacter = (characterPath: string) => {
    setDJData(prevState => ({ ...prevState, selectedCharacterPath: characterPath }));
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleClick();
    }
  };

  const { name, selectedCharacterPath } = djData;

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    isLoading ? (
      <Container className="d-flex justify-content-center align-items-center menu-container">
        <h1 className='text-light'>Carregando</h1>
        <Spinner animation="border" className='text-light'/>
      </Container>
    ) : (
      <Container className="menu-container">
        {phase === 1 ? (
          <div className="menu-background">
            <div className="text-center">
              <Image src={selectedCharacterPath} alt="Avatar escolhido" className="chosen-character" roundedCircle />
              <h2 className="text-white">{name}</h2>
            </div>
            <h1 className="text-white">Escolha o seu personagem</h1>
            <Card
              className="text-center card-style hide-scrollbar"
              style={{
                backgroundColor: '#000000',
                boxShadow: '0 0 0 0.5px #ffffff',
                padding: '0'
                }}
                >
              <Card.Body>
              <Row className="image-container">
                {charactersPaths.map((character, index) => (
                  <Col key={index} className="image-col">
                    <Image
                      src={character}
                      alt={`Character ${index}`}
                      onClick={() => handleClickCharacter(character)}
                      onMouseEnter={() => setHoveredCharacter(character)}
                      onMouseLeave={() => setHoveredCharacter(null)}
                      className={`image-style ${djData.selectedCharacterPath === character ?
                        'selected-style' : ''}`}
                      style={{ opacity: hoveredCharacter === character ? 0.8 : 1 }}
                    />
                  </Col>
                ))}
              </Row>
              </Card.Body>
            </Card>
            <Button variant="primary" onClick={handleClick} className="mt-3" style={{ width: '100%'}}>Ok</Button>
          </div>
        ) : (
          <div className="menu-background text-center">
            <Image
              src={selectedCharacterPath}
              alt="Avatar escolhido"
              className="chosen-character"
              roundedCircle
              />
            <Form.Control
              type="text"
              placeholder="Insira um vulgo"
              name="name"
              value={name}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              className="my-3 custom-input"
              style={{ textAlign: 'center' }}
            />
            <Button
              variant="primary"
              onClick={handleClick}
              disabled={buttonDisabled}
              style={{ width: '100%'}}
              >
                Ok
            </Button>
          </div>
        )}
        <MessagePopup show={showPopup} handleClose={handleClosePopup} message={popupMessage} />
      </Container>
    )
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const CreateDJConnected = connect(mapStateToProps)(CreateDJ);

export default CreateDJConnected;
