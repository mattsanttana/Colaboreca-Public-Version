import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RootState } from '../redux/store';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import Header from './Header';
import Menu from './Menu';
import useDJ from '../utils/useDJ';
import usePlayback from '../utils/usePlayback';
import useTrack from '../utils/useTrack';
import { DJ } from '../types/DJ';
import TQueue from '../types/TQueue';
import { logo } from '../assets/images/characterPath';

type Props = {
  token: string;
};

const Queue: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [trackFound, setTrackFound] = useState<boolean>(false);
  const [dj, setDJ] = useState<DJ | undefined>(undefined);
  const [queue, setQueue] = useState<TQueue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const trackActions = useTrack();
  const djActions = useDJ();
  const playbackActions = usePlayback();

  useEffect(() => {
    const fetchQueue = async () => {
      if (trackId && token) {
        try {
          const [fetchedTrack, fetchedDJ, fetchedQueue] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.getDJByToken(token),
            playbackActions.getQueue(trackId),
          ]);

          if (fetchedTrack?.status === 200 && fetchedDJ?.status === 200 && fetchedQueue) {
            setTrackFound(true);
            setDJ(fetchedDJ.data);
            setQueue(fetchedQueue);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchQueue();
  }, [trackActions, djActions, playbackActions, token, trackId]);

  useEffect(() => {
    const pageType = window.location.pathname.split('/')[1];
    if (pageType !== 'track-info') {
      setIsOwner(false);
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <h1 className="text-light">Carregando</h1>
          <Spinner animation="border" className="text-light" />
        </Container>
      ) : trackFound ? (
        <Container>
          <Header />
          <Row>
            {!isOwner && (
              <Col md={3}>
                <Menu dj={dj} />
              </Col>
            )}
            <Col className="py-4">
              <Card
                className="text-center text-light"
                style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
              >
                <Card.Body className='hide-scrollbar' style={{ width: '100%', height: '848px', overflowY: 'auto' }}>
                  <Card.Title>Fila</Card.Title>
                  <div className="table-responsive">
                    <Table striped>
                      <thead>
                        <tr>
                          <th className="text-light" style={{ backgroundColor: '#000000' }}>Personagem</th>
                          <th className="text-light" style={{ backgroundColor: '#000000' }}>Vulgo</th>
                          <th className="text-light" style={{ backgroundColor: '#000000' }}>Música</th>
                          <th className="text-light" style={{ backgroundColor: '#000000' }}>Artista</th>
                          <th className="text-light" style={{ backgroundColor: '#000000' }}>Capa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queue?.map((track, index) => (
                          <tr key={index}>
                            <td className="text-light" style={{ backgroundColor: '#000000' }}>
                              <img
                                src={track.characterPath || logo}
                                alt={track.musicName}
                                className="img-thumbnail img-thumbnail-hover"
                                style={{ width: '50px', height: '50px', cursor: 'pointer', backgroundColor: '#000000' }}
                              />
                            </td>
                            <td className="text-light" style={{ backgroundColor: '#000000' }}>{track.addedBy}</td>
                            <td className="text-light" style={{ backgroundColor: '#000000' }}>{track.musicName}</td>
                            <td className="text-light" style={{ backgroundColor: '#000000' }}>{track.artists.join(', ')}</td>
                            <td className="text-light" style={{ backgroundColor: '#000000' }}>
                              <img
                                src={track.cover}
                                alt={track.musicName}
                                className="img-thumbnail"
                                style={{ width: '70px', height: '70px', backgroundColor: '#000000' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      ) : (
        <Container className="text-center">
          <h1>Esta pista não existe</h1>
          <Button onClick={() => navigate('/')}>Página inicial</Button>
        </Container>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token,
});

const QueueConnected = connect(mapStateToProps)(Queue);

export default QueueConnected;
