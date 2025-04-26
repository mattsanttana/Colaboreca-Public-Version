import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Nav, Image } from 'react-bootstrap';
import { FaHome, FaUser, FaMusic, FaList, FaChartLine, FaComments, FaSignOutAlt } from 'react-icons/fa';
import { DJ } from '../types/DJ';

type Props = {
  dj: DJ | undefined;
  isTrackOwner: boolean;
};

const Menu: React.FC<Props> = ({ dj, isTrackOwner }) => {
  const { trackId } = useParams(); // Pega o ID da pista da URL
  const navigate = useNavigate();

  const handleRedirect = (path: string) => {
    navigate(path);
  };

  return (
    <aside className='menu-container' style={{ backgroundColor: '#000000', marginTop: '1%' }}>
      <Container className="p-3 text-center menu-height-container">
        { !isTrackOwner && (
          <Row className="mb-3 menu-container">
            <Col>
              <Image src={dj?.characterPath} alt={dj?.djName} className="img-fluid rounded-circle mb-3" />
              <div className="d-flex justify-content-center align-items-center squeres-container">
              <div className={`rank-square ${dj?.ranking === 1 ? 'gold' : dj?.ranking === 2 ? 'silver' : dj?.ranking === 3 ? 'bronze' : ''}`}>
                {dj?.ranking ? `${dj.ranking}º` : '-'}
              </div>
                <div className="name-square mx-3">{dj?.djName}</div>
                <div className="points-square">{dj?.score} pts</div>
              </div>
            </Col>
          </Row>
        )}
        <Nav className="flex-column">
          <Nav.Item className='menu-item'>
            <Nav.Link
              onClick={() => handleRedirect(isTrackOwner ? `/track-info/${trackId}` : `/track/${trackId}`)} // Corrigi a interpolação de string
              className="d-flex align-items-left justify-content-left"
              style={{ color: '#0e99fc'}}
            >
              <FaHome className="me-2" />Início
            </Nav.Link>
          </Nav.Item>
          { !isTrackOwner && (
            <>
              <Nav.Item className='menu-item'>
                <Nav.Link
                  onClick={() => handleRedirect(`/track/profile/${trackId}/${dj?.id}`)} // Corrigi a interpolação de string
                  className="d-flex align-items-left justify-content-left"
                  style={{ color: '#0e99fc'}}
                >
                  <FaUser className="me-2" />Perfil
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className='menu-item'>
                <Nav.Link
                  onClick={() => handleRedirect(`/track/add-music/${trackId}`)} // Corrigi a interpolação de string
                  className="d-flex align-items-left justify-content-left"
                  style={{ color: '#0e99fc'}}
                >
                  <div className="d-flex align-items-center text-start">
                    <FaMusic className="me-2" />Adicionar música à fila
                  </div>
                </Nav.Link>
              </Nav.Item>
            </>
          )}
          <Nav.Item className='menu-item'>
            <Nav.Link
              onClick={() => handleRedirect(isTrackOwner ? `/track-info/queue/${trackId}` : `/track/queue/${trackId}`)} // Corrigi a interpolação de string
              className="d-flex align-items-left justify-content-left"
              style={{ color: '#0e99fc'}}
            >
              <FaList className="me-2" />Fila
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              onClick={() => handleRedirect(isTrackOwner ? `/track-info/ranking/${trackId}` : `/track/ranking/${dj?.trackId}`)} // Corrigi a interpolação de string
              className="d-flex align-items-left justify-content-left"
              style={{ color: '#0e99fc'}}
            >
              <FaChartLine className="me-2" />Ranque
            </Nav.Link>
          </Nav.Item>
          { !isTrackOwner && (
            <Nav.Item className='menu-item'>
              <Nav.Link
                onClick={() => handleRedirect(`/track/chat/${trackId}`)} // Corrigi a interpolação de string
                className="d-flex align-items-left justify-content-left"
                style={{ color: '#0e99fc'}}
              >
                <FaComments className="me-2" />Papinho
              </Nav.Link>
            </Nav.Item>
          )}
          <Nav.Item className='menu-item'>
            <Nav.Link
              onClick={() => handleRedirect('/')}
              className="d-flex align-items-left justify-content-left"
              style={{ color: '#0e99fc'}}
            >
              <div className="d-flex align-items-center text-start">
                <FaSignOutAlt className="me-2" />Página inicial
              </div>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>
    </aside>
  );
};

export default Menu;
