import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import MessagePopup from './MessagePopup';
import CreateDJConnected from './CreateDJ'
import useTrack from '../utils/useTrack';
import { logo } from '../assets/images/characterPath';

const EnterTrack: React.FC = () => {
  const [trackId, setTrackId] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [phase, setPhase] = useState<number>(1);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>('');

  const trackActions = useTrack();

  const inputValidation = useCallback(() => {
    setButtonDisabled(!(trackId && trackId.replace(/\s/g, '').length === 6));
  }, [trackId]);

  useEffect(() => {
    inputValidation();
  }, [inputValidation]);

  const formatTrackId = (value: string) => {
    const cleaned = value.replace(/\D/g, '').substring(0, 6); // Remove non-digits and limit to 6 digits
    const part1 = cleaned.substring(0, 3);
    const part2 = cleaned.substring(3, 6);
    return part2 ? `${part1} ${part2}` : part1;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTrackId(event.target.value);
    setTrackId(formattedValue);
  };

  const handleClick = async () => {
    const cleanedTrackId = trackId.replace(/\s/g, ''); // Remove spaces before sending
    if (cleanedTrackId) {
      const response = await trackActions.enterTrack(cleanedTrackId);
      if (response && response.status === 200) {
        setPhase(2);
      } else if (response && response.status === 404) {
        setPopupMessage('Pista não encontrada');
        setShowPopup(true);
      } else {
        setPopupMessage('Algo deu errado, por favor tente novamente em alguns minutos');
        setShowPopup(true);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && trackId.replace(/\s/g, '').length === 6) {
      handleClick();
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      <Row className="justify-content-center d-flex flex-column">
        <Col xs={12} md={8} lg={11} className="text-center mb-5">
          {phase === 1 ? (
            <>
              <img
                src={logo}
                alt='logo'
                className='img-fluid shadow-lg mb-5'
                style={{ maxWidth: '300px' }}
              />
              <Form.Group className="mb-3" style={{ maxWidth: '500px'}}>
                <Form.Control
                  type="text"
                  placeholder="Pin da Pista"
                  name="trackId"
                  value={trackId}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  style={{ height: '50px', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}
                  className="text-center custom-input"
                  autoComplete="off"
                />
                <Button
                  variant="primary"
                  disabled={buttonDisabled}
                  onClick={handleClick}
                  style={{ height: '50px', fontSize: '1.2rem', marginTop: '10px', width: '100%' }}
                >
                  Entrar
                </Button>
              </Form.Group>
            </>
          ) : (
            <CreateDJConnected trackId={trackId.replace(/\s/g, '')} />
          )}
        </Col>
      </Row>
      <MessagePopup show={showPopup} handleClose={handleClosePopup} message={popupMessage} />
    </Container>
  );
};

export default EnterTrack;