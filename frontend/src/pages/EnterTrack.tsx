import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import CreateDJConnected from './CreateDJ';
import useTrack from '../utils/useTrack';
import '../styles.css';
import { logo } from '../teste_avatares/characterPath';

const EnterTrack = () => {
  const [trackId, setTrackId] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const [phase, setPhase] = useState<number>(1);

  const trackActions = useTrack();

  const inputValidation = useCallback(() => {
    setButtonDisabled(!(trackId && trackId.toString().length === 6));
  }, [trackId]);

  useEffect(() => {
    inputValidation();
  }, [inputValidation]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTrackId(event.target.value);
  };

  const handleClick = async () => {
    if (trackId) {
      const response = await trackActions.enterTrack(trackId);
      if (response && response.status === 200) {
        setPhase(2);
      } else if (response && response.status === 404) {
        alert('Pista não encontrada');
      } else {
        alert('Algo deu errado, por favor tente novamente em alguns minutos');
      }
    }
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
                className='img-fluid rounded-circle shadow-lg mb-5'
                style={{ maxWidth: '300px' }}
              />
              <Form.Group className="mb-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <Form.Control
                  type="number"
                  placeholder="Pin da Pista"
                  name="trackId"
                  value={trackId}
                  onChange={handleChange}
                  style={{ height: '50px', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}
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
            <CreateDJConnected trackId={trackId} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EnterTrack;
