import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Nav, Image } from 'react-bootstrap';
import { FaHome, FaUser, FaMusic, FaList, FaChartLine, FaComments } from 'react-icons/fa';
import { DJ } from '../types/DJ';

type Props = {
  dj: DJ | undefined;
}

const Menu: React.FC<Props> = ({ dj }) => {
  return (
    <aside
      className='menu-container'
      style={{ backgroundColor: '#000000',boxShadow: '0 0 0 0.5px #ffffff', marginTop: '1%' }}
    >
      <Container className="p-3 text-center menu-height-container">
        <Row className="mb-3 menu-container">
          <Col>
            <Image src={dj?.characterPath} alt={dj?.djName} className="img-fluid rounded-circle mb-3" />
            <div className="d-flex justify-content-center align-items-center squeres-container">
              <div className="rank-square">{dj?.ranking || '-'}</div>
              <div className="name-square mx-3">{dj?.djName}</div>
              <div className="points-square">{dj?.score} pts</div>
            </div>
          </Col>
        </Row>
        <Nav className="flex-column">
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track/${dj?.trackId}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaHome className="me-2" />Início
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track/profile/${dj?.trackId}/${dj?.id}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaUser className="me-2" />Perfil
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track/add-music/${ dj?.trackId }`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaMusic className="me-2" />Adicionar música à fila
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track/queue/${dj?.trackId}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaList className="me-2" />Fila
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track/ranking/${dj?.trackId}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaChartLine className="me-2" />Ranque
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track/chat?track-id=${dj?.trackId}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaComments className="me-2" />Chat
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>
    </aside>
  );
}

export default Menu;