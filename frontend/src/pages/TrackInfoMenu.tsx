import { Link } from 'react-router-dom';
import { Container, Nav } from 'react-bootstrap';
import { FaHome, FaList, FaChartLine} from 'react-icons/fa';
import React from 'react';

type Props = {
  trackId: string | undefined;
}

const TrackInfoMenu: React.FC<Props> = ({ trackId }) => {
  return (
    <aside
      className='menu-container'
      style={{ backgroundColor: '#000000',boxShadow: '0 0 0 0.5px #ffffff', marginTop: '1%' }}
    >
      <Container className="p-3 text-center menu-height-container">
        <Nav className="flex-column">
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track-info/${trackId}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaHome className="me-2" />Início
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track-info/queue/${trackId}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaList className="me-2" />Fila
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              as={Link}
              to={`/track-info/ranking/${trackId}`}
              className="d-flex align-items-center justify-content-center"
              style={{ color: '#0e99fc'}}
            >
              <FaChartLine className="me-2" />Ranque
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>
    </aside>
  );
}

export default TrackInfoMenu;