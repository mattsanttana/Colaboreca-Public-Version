import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveDJ } from '../redux/actions';
import { charactersPaths } from '../teste_avatares/characterPath';
import useDJ from '../utils/useDJ';
import { RootState } from '../redux/store';
import { Container, Button, Form, Row, Col, Image, Spinner, Card } from 'react-bootstrap';

const randomCharacter = charactersPaths[Math.floor(Math.random() * charactersPaths.length)];

interface CreateDJProps {
  token: string;
  trackId: string;
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1',
  objectFit: 'cover',
  cursor: 'pointer',
};

const selectedStyle: React.CSSProperties = {
  border: '2px solid yellow',
};

const cardStyle: React.CSSProperties = {
  height: '480px',
  maxHeight: '80vh',
  width: '100%',
  maxWidth: '600px',
  overflowY: 'auto',
  margin: '0 auto',
};

const hideScrollbar: React.CSSProperties = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none'
};

const CreateDJ: React.FC<CreateDJProps> = ({ token, trackId }) => {
  const [djData, setDJData] = useState({
    name: '',
    selectedCharacterPath: randomCharacter,
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [phase, setPhase] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCharacter, setHoveredCharacter] = useState<string | null>(null);

  const djActions = useDJ();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const response = await djActions.verifyIfDjHasAlreadyBeenCreatedForThisTrack(token);
      if (response?.status === 200) {
        navigate(`/track/${response.data}`);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [navigate, token, djActions]);

  const inputValidation = (name: string) => {
    if (name.length >= 3 && name.length <= 16) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = event.target;

    if (inputName in djData) {
      setDJData(prevState => ({ ...prevState, [inputName]: value }));
      inputValidation(value);
    }
  };

  const handleClick = async () => {
    const { name, selectedCharacterPath } = djData;

    if (phase === 1) {
      setPhase(2);
      return;
    }

    if (phase === 2) {
      const dj = await djActions.createDJ({ djName: name, characterPath: selectedCharacterPath, trackId });

      if (dj && dj.status === 201) {
        dispatch(saveDJ(dj.data.token));
        navigate(`/track/${trackId}`);
      } else if (dj && dj.status === 400) {
        alert('Este vulgo já existe');
      } else if (dj && dj.status === 401) {
        alert('Pista expirada, por favor entre em uma nova pista');
      } else {
        alert('Algo deu errado, por favor tente novamente em alguns minutos');
        navigate('/');
      }
    }
  };

  const handleClickCharacter = (characterPath: string) => {
    setDJData(prevState => ({ ...prevState, selectedCharacterPath: characterPath }));
  };

  const { name, selectedCharacterPath } = djData;

  return (
    isLoading ? (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
            <Card className="text-center" style={{ ...cardStyle, ...hideScrollbar }}>
              <Card.Body>
                <Row className="image-row justify-content-center">
                  {charactersPaths.map((character, index) => (
                    <Col xs={6} sm={4} md={3} lg={2} xl={3} key={index} className="p-2">
                      <Image
                        src={character}
                        alt={`Character ${index}`}
                        onClick={() => handleClickCharacter(character)}
                        onMouseEnter={() => setHoveredCharacter(character)}
                        onMouseLeave={() => setHoveredCharacter(null)}
                        style={{
                          ...imageStyle,
                          ...(djData.selectedCharacterPath === character ? selectedStyle : {}),
                          ...(hoveredCharacter === character ? { opacity: 0.8 } : {}),
                        }}
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
            <Image src={selectedCharacterPath} alt="Avatar escolhido" className="chosen-character" roundedCircle />
            <Form.Control
              type="text"
              placeholder="Insira um vulgo"
              name="name"
              value={name}
              onChange={handleChange}
              className="my-3"
              style={{ textAlign: 'center' }}
            />
            <Button variant="primary" onClick={handleClick} disabled={buttonDisabled} style={{ width: '100%'}}>Ok</Button>
          </div>
        )}
      </Container>
    )
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const CreateDJConnected = connect(mapStateToProps)(CreateDJ);

export default CreateDJConnected;
