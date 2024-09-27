import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Table, Button, Spinner, Container, Col,
  Row, Card, Popover, OverlayTrigger, Modal
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { RootState } from '../redux/store';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import { DJ } from '../types/DJ';
import Header from './Header';
import Menu from './Menu';
import MessagePopup from './MessagePopup';

interface Props {
  trackToken: string;
  djToken: string;
}

const DJs: React.FC<Props> = ({ trackToken, djToken }) => {
  const { trackId } = useParams();
  const [isOwner, setIsOwner] = useState<boolean>(true);
  const [trackFound, setTrackFound] = useState<boolean>(false);
  const [dj, setDJ] = useState<DJ | undefined>(undefined);
  const [djs, setDJs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const djActions = useDJ();
  const trackActions = useTrack();
  const navigate = useNavigate();

  useEffect(() => {
    const pageType = window.location.pathname.split('/')[1];
    if (pageType !== 'track-info') {
      setIsOwner(false);
    }
  }
  , []);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const [fetchedTrack, fetchedVerifyLogin, fetchedDJs, fetchedDJ] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(djToken),
            djActions.getAllDJs(trackId),
            djActions.getDJByToken(djToken)
          ]);

          if (fetchedVerifyLogin?.status !== 200) {
            setPopupMessage('Você não está logado, por favor faça login novamente');
            setRedirectTo('/enter-track');
            setShowPopup(true);
        }

          if (fetchedDJ?.status !== 200) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowPopup(true);
        }
    
          if (fetchedTrack?.status === 200) {
            setDJ(fetchedDJ?.data);
            setDJs(fetchedDJs);
            setTrackFound(true);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }
  , [trackId, trackActions, djActions, djToken]);

  const handleViewProfile = (djId: string) => {
    const profileUrl = isOwner
      ? `/track-info/profile/${trackId}/${djId}`
      : `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const handleExpelDJ = (dj: DJ) => {
    setSelectedDJ(dj);
    setShowConfirmModal(true);
  };

  const confirmExpelDJ = () => {
    if (selectedDJ) {
      trackActions.deleteDJ(String(selectedDJ.id), trackToken)
        .then(response => {
          console.log('DJ expulso com sucesso:', response);
          setDJs(prevDjs => prevDjs.filter(dj => dj.id !== selectedDJ.id));
        })
        .catch(error => {
          console.error('Erro ao expulsar DJ:', error);
        })
        .finally(() => {
          setShowConfirmModal(false);
          setSelectedDJ(null);
        });
    }
  };

  const renderPopover = (pDJ: DJ) => (
  <Popover id={`popover-${pDJ.id}`}>
    <Popover.Body>
      <Button variant="link" onClick={() => handleViewProfile(String(pDJ.id))}>Perfil</Button>
      {(!isOwner && pDJ.id !== dj?.id) && (
        <Button variant="link" onClick={() => console.log(`Chat com DJ: ${pDJ.djName}`)}>Chat</Button>
      )}
    </Popover.Body>
  </Popover>
);

  return (
    <>
      <MessagePopup
        show={showPopup}
        handleClose={() => setShowPopup(false)}
        message={popupMessage}
        redirectTo={redirectTo}
      />
      {isLoading ? (
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
            <Col className="py-4">
              <Card className="text-center text-light">
                <Card.Body
                  style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
                >
                  <Card.Title>DJs na sala:</Card.Title>
                  {djs.length === 0 ? (
                    <Card.Text>Nenhum DJ entrou na sala.</Card.Text>
                  ) : (
                    <div className="table-responsive">
                      <Table striped>
                        <thead>
                          <tr>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                            </th>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                              Ranque
                            </th>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                              Vulgo
                            </th>
                            <th
                              className='text-light'
                              style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                            >
                              Pontos
                            </th>
                            {isOwner && (
                              <>
                                <th
                                  className='text-light'
                                  style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                                >
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {djs.sort((a, b) => a.ranking - b.ranking).map((dj: DJ) => (
                            <tr key={dj.id}>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                <OverlayTrigger
                                  trigger="click"
                                  placement="top"
                                  overlay={renderPopover(dj)}
                                  rootClose
                                >
                                  <img 
                                    src={dj.characterPath} 
                                    alt={dj.djName} 
                                    className='img-thumbnail img-thumbnail-hover' 
                                    style={{ width: '50px', height: '50px', cursor: 'pointer', backgroundColor: '#000000' }} 
                                  />
                                </OverlayTrigger>
                              </td>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                {dj.ranking === 0 ? '-' : dj.ranking}
                              </td>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                {dj.djName}
                              </td>
                              <td
                                className='text-light'
                                style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                              >
                                {dj.score}
                              </td>
                              {isOwner && (
                                <>
                                  <td
                                    className='text-light'
                                    style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                                  >
                                    <Button variant="danger" onClick={() => handleExpelDJ(dj)}>Expulsar</Button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
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
      )}

      <Modal className="custom-modal" show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton style={{ borderBottom: 'none' }}>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>Você tem certeza que deseja expulsar este DJ?</Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmExpelDJ}>
            Expulsar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  trackToken: state.trackReducer.token,
  djToken: state.djReducer.token
});

const DJsConnected = connect(mapStateToProps)(DJs);

export default DJsConnected;
