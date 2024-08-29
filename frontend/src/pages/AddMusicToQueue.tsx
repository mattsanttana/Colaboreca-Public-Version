import { useEffect, useState } from 'react';
import { Card, Col, Container, Form, Row, Spinner, Modal, Button } from 'react-bootstrap';
import Header from './Header';
import Menu from './Menu';
import usePlayback from '../utils/usePlayback';
import useDJ from '../utils/useDJ';
import { connect } from 'react-redux';
import { RootState } from '../redux/store';
import { Track } from '../types/SpotifySearchResponse';
import { useParams } from 'react-router-dom';
import useDebounce from '../utils/useDebounce';

interface Props {
  token: string;
}

const AddMusicToQueue: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [dj, setDJ] = useState();
  const [topTracksInBrazil, setTopTracksInBrazil] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false); // Estado para controle de carregamento
  const [modalMessage, setModalMessage] = useState(''); // Estado para mensagem do modal
  const [isConfirmed, setIsConfirmed] = useState(false);

  const playbackActions = usePlayback();
  const djActions = useDJ();
  
  const debouncedSearch = useDebounce(search, 600);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedDJ, fetchedGetTopTracksInBrazil] = await Promise.all([
          djActions.getDJByToken(token),
          playbackActions.getTopMusicsInBrazil(trackId),
        ]);

        if (fetchedDJ?.status === 200) {
          setDJ(fetchedDJ.data);
        } else {
          console.error('Error fetching DJ');
        }

        if (fetchedGetTopTracksInBrazil?.status === 200) {
          setTopTracksInBrazil(fetchedGetTopTracksInBrazil.data);
        } else {
          console.error('Error fetching top tracks in Brazil');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim() === '') {
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      setIsDebouncing(true);
      try {
        const response = await playbackActions.getTrackBySearch(trackId, debouncedSearch);
        if (response?.status !== 200) {
          console.error('Error response from Spotify:', response?.data);
          return;
        } else {
          setSearchResults(response.data);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setIsDebouncing(false);
      }
    };

    fetchSearchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
  }

  const handleClick = (track: Track) => {
    setSelectedTrack(track);
    setShowModal(true);
  }

  const handleConfirmAddTrack = async () => {
    if (selectedTrack) {
      setIsAddingTrack(true); // Inicia o carregamento
      setModalMessage(''); // Limpa a mensagem do modal
      try {
        const response = await playbackActions.addTrackToQueue(trackId, selectedTrack.uri, token);
        if (response?.status === 409) {
          setModalMessage('Essa música já está na fila, por favor adicione outra.');
        } else if (response?.status === 401) {
          setModalMessage('Token inválido, por favor faça login novamente.');
        } else if (response?.status === 404) {
          setModalMessage('Falha ao tentar reproduzir a música, nenhum dispositivo ativo encontrado.');
        } else {
          setModalMessage('Música adicionada à fila com sucesso!');
        }
      } catch (error) {
        console.error(error);
        setModalMessage('Ocorreu um erro ao adicionar a música à fila.');
      } finally {
        setIsAddingTrack(false); // Encerra o carregamento
      }
    }
  }

  const handleConfirm = () => {
    setIsConfirmed(true);
    handleConfirmAddTrack();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrack(null);
    setIsConfirmed(false);
  }

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
        <Col className="py-4" md={9}>
          <Card className="text-center text-light" style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}>
            <Card.Body
              className="hide-scrollbar"
              style={{ width: '100%', height: '870px', overflowY: 'auto' }}
            >
              <Form.Control
                type="text"
                placeholder="Pesquisar"
                value={search}
                onChange={handleChange}
                className="my-3 custom-input"
                style={{ 
                  textAlign: 'center', 
                  position: 'sticky',
                  top: '0px',
                  zIndex: 1000,
                  backgroundColor: '#000000'
                }}
              />
              {isDebouncing ? (
                <div className="d-flex justify-content-center align-items-center my-4">
                  <Spinner animation="border" className="text-light" />
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <h1>Resultados da busca:</h1>
                  <Row>
                    {searchResults.map((track: Track, index) => (
                      <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                        <Card
                          className="image-col text-light"
                          style={{ cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
                          onClick={() => handleClick(track)}
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
                  {isDebouncing && (
                    <div className="d-flex justify-content-center align-items-center my-4">
                      <Spinner animation="border" className="text-light" />
                    </div>
                  )}
                </>
              ) : (
                !isDebouncing && (
                  <>
                    <h1>Populares no Brasil:</h1>
                    <Row>
                      {topTracksInBrazil.map((track: Track, index) => (
                        <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                          <Card
                            className="image-col text-light"
                            style={{ cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
                            onClick={() => handleClick(track)}
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
                  </>
                )
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmação */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isAddingTrack ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner animation="border" className="text-dark" />
              <span className="ml-3">Adicionando à fila...</span>
            </div>
          ) : (
            <div>
              <p>{modalMessage || `Deseja adicionar a música "${selectedTrack?.name}" à fila?`}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!isAddingTrack && !isConfirmed && (
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleConfirm}>
                Confirmar
              </Button>
            </>
          )}
          {isConfirmed && (
            <Button variant="primary" onClick={handleCloseModal}>
              Fechar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token,
});

const AddMusicToQueueConnected = connect(mapStateToProps)(AddMusicToQueue);

export default AddMusicToQueueConnected;
