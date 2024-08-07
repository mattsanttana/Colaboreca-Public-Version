import { useEffect, useState } from 'react';
import { Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import Header from './Header';
import Menu from './Menu';
import usePlayback from '../utils/usePlayback';
import useDJ from '../utils/useDJ';
import { connect } from 'react-redux';
import { RootState } from '../redux/store';
import { Track } from '../types/SpotifySearchResponse';
import { useParams } from 'react-router-dom';

interface Props {
  token: string;
}

const AddMusicToQueue: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [dj, setDJ] = useState();
  const [topTracksInBrazil, setTopTracksInBrazil] = useState([]);
  const [search, setSearch] = useState('');

  const playbackActions = usePlayback();
  const djActions = useDJ();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedDJ, fetchedGetTopTracksInBrazil] = await Promise.all([
          djActions.getDJByToken(token),
          playbackActions.getTopTracksInBrazil(trackId),
        ]);

        if (fetchedDJ?.status === 200) {
          setDJ(fetchedDJ.data);
        } else {
          console.log('Error fetching DJ');
        }

        if (fetchedGetTopTracksInBrazil?.status === 200) {
          setTopTracksInBrazil(fetchedGetTopTracksInBrazil.data);
        } else {
          console.log('Error fetching top tracks in Brazil');
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <h1 className="text-light">Carregando</h1>
      <Spinner animation="border" className="text-light" />
    </Container>
  ) : (
    <Container>
      <Header />
      <Row>
        <Col md={3}>
          <Menu dj={dj} />
        </Col>
        <Col className={'py-4'} md={9}>
          <Card className="text-center text-light" style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}>
            <Card.Body
              className="hide-scrollbar"
              style={{ width: '100%', height: '870px', overflowY: 'auto' }}
              >
               <Form.Control
                type="text"
                placeholder="Pesquisar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="my-3 custom-input"
                style={{ 
                  textAlign: 'center', 
                  position: 'sticky',
                  top: '0px',
                  zIndex: 1000,
                  backgroundColor: '#000000'
                }}
              />
              <h1>Populares no Brasil:</h1>
              <Row>
                {topTracksInBrazil.map((track: Track, index) => (
                  <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                    <Card
                      className="image-col text-light"
                      style={{ cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
                      onClick={() => console.log('adicionou a fila')}
                    >
                      <Card.Img variant="top" src={track.album.images[0].url} />
                      <Card.Body>
                        <Card.Title>{track.name}</Card.Title>
                        <Card.Text>
                          {track.artists.map((artist) => artist.name).join(', ')}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token,
});

const AddMusicToQueueConnected = connect(mapStateToProps)(AddMusicToQueue);

export default AddMusicToQueueConnected;