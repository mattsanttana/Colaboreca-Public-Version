import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Table, Button, Spinner, Container, Col, Row, Card, Popover, OverlayTrigger } from 'react-bootstrap';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import DJ from '../types/DJ';
import { RootState } from '../redux/store';
import Header from './Header';
import Menu from './Menu';

interface Props {
  trackToken: string;
  djToken: string;
}

const DJs: React.FC<Props> = ({ trackToken, djToken }) => {
  const { trackId } = useParams();
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [trackFound, setTrackFound] = useState<boolean>(false);
  const [dj, setDJ] = useState<DJ | undefined>(undefined);
  const [djs, setDjs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const djActions = useDJ();
  const trackActions = useTrack();
  const navigate = useNavigate();
  const intervalId1 = useRef<null | NodeJS.Timeout>(null);
  const intervalId2 = useRef<null | NodeJS.Timeout>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const [fetchedTrack, fetchedDjs] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.getAllDJs(trackId),
          ]);

          if (fetchedTrack?.status === 200) {
            setDjs(fetchedDjs);
            setTrackFound(true);
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
  }, [djActions, trackActions, trackId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pageType = window.location.pathname.split('/')[1];
        if (pageType !== 'track-info') {
          setIsOwner(false);
          const DJ = await djActions.getDJByToken(djToken);
          if (DJ) {
            setDJ(DJ);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    intervalId2.current = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      if (intervalId2.current) clearInterval(intervalId2.current);
    };
  }, [djActions, djToken]);

  const handleViewProfile = (djId: string) => {
    const profileUrl = isOwner
      ? `/track-info/profile/${trackId}/${djId}`  // URL para proprietário
      : `/track/profile/${trackId}/${djId}`;      // URL para não proprietário
    navigate(profileUrl);
  };

  const renderPopover = (dj: DJ) => (
    <Popover id={`popover-${dj.id}`}>
      <Popover.Body>
        <Button variant="link" onClick={() => handleViewProfile(String(dj.id))}>Perfil</Button>
        <Button variant="link" onClick={() => console.log(`Chat com DJ: ${dj.djName}`)}>Chat</Button>
      </Popover.Body>
    </Popover>
  );

  return (
    isLoading ? (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <h1 className='text-light'>Carregando</h1>
        <Spinner animation="border" className='text-light'/>
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
          <Col>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>DJs na sala:</Card.Title>
                {djs.length === 0 ? (
                  <Card.Text>Nenhum DJ entrou na sala.</Card.Text>
                ) : (
                  <Table striped bordered hover className="custom-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Ranque</th>
                        <th>Nome</th>
                        <th>Pontos</th>
                        {isOwner && (
                          <>
                            <th>Créditos</th>
                            <th>Ações</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {djs.sort((a, b) => a.ranking - b.ranking).map((dj: DJ) => (
                        <OverlayTrigger
                          key={dj.id}
                          trigger="click"
                          placement="top"
                          overlay={renderPopover(dj)}
                          rootClose
                        >
                          <tr style={{ cursor: 'pointer' }}>
                            <td>
                              <img src={dj.characterPath} alt={dj.djName} className='img-thumbnail' style={{ width: '50px', height: '50px' }} />
                            </td>
                            <td>{dj.ranking === 0 ? '-' : dj.ranking}</td>
                            <td>{dj.djName}</td>
                            <td>{dj.score}</td>
                            {isOwner && (
                              <>
                                <td>{dj.credits}</td>
                                <td>
                                  <Button variant="danger" onClick={() => trackActions.deleteDJ(String(dj.id), trackToken)}>Expulsar</Button>
                                </td>
                              </>
                            )}
                          </tr>
                        </OverlayTrigger>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    ) : (
      <Container className="text-center">
        <h1>Esta pista não existe</h1>
        <Button onClick={() => navigate("/")}>Página inicial</Button>
      </Container>
    )
  );
};

const mapStateToProps = (state: RootState) => ({
  trackToken: state.trackReducer.token,
  djToken: state.djReducer.token
});

const DJsConnected = connect(mapStateToProps)(DJs);

export default DJsConnected;
