import { Container, Nav } from 'react-bootstrap';
import { FaHome, FaList, FaChartLine, FaSignOutAlt} from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  trackId: string | undefined;
}

const TrackInfoMenu: React.FC<Props> = ({ trackId }) => {
  const navigate = useNavigate();
  
  const handleRedirect = (path: string) => {
    navigate(path);
  };
  
  return (
    <aside
      className='menu-container'
      style={{ backgroundColor: '#000000', marginTop: '1%' }}
    >
      <Container className="p-3 text-center menu-height-container">
        <Nav className="flex-column">
          <Nav.Item className='menu-item'>
            <Nav.Link
              onClick={() => handleRedirect(`/track-info/${trackId}`)}
              className="d-flex align-items-center justify-content-left"
              style={{ color: '#0e99fc'}}
            >
              <FaHome className="me-2" />Início
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              onClick={() => handleRedirect(`/track-info/queue/${trackId}`)}
              className="d-flex align-items-center justify-content-left"
              style={{ color: '#0e99fc'}}
            >
              <FaList className="me-2" />Fila
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className='menu-item'>
            <Nav.Link
              onClick={() => handleRedirect(`/track-info/ranking/${trackId}`)}
              className="d-flex align-items-center justify-content-left"
              style={{ color: '#0e99fc'}}
            >
              <FaChartLine className="me-2" />Ranque
            </Nav.Link>
          </Nav.Item>
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
}

export default TrackInfoMenu;