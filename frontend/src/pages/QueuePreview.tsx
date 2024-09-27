import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Table } from 'react-bootstrap';
import { Music } from '../types/SpotifySearchResponse';

type Props = {
  trackId: string | undefined;
  queue: Music[] | undefined;
}

const QueuePreview: React.FC<Props> = ({ trackId, queue }) => {
  const [isOwner, setIsOwner] = useState<boolean>(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const pageType = window.location.pathname.split('/')[1];
    if (pageType !== 'track-info') {
      setIsOwner(false);
    }
  }
  , []);

  const redirectLink = isOwner ? `/track-info/queue/${ trackId }` : `/track/queue/${ trackId }`;

  const previewQueue = Array.isArray(queue) ? queue.slice(0, 5) : [];

  return (
    <Container className="py-4">
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
      >
        <Card.Body className='hide-scrollbar' style={{height: '400px', overflow: 'auto'}}>
          <Card.Title>Fila:</Card.Title>
             <div className="table-fixed">
              <Table striped>
                <thead>
                  <tr>
                    <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Música</th>
                    <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Artista</th>
                    <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Capa</th>
                  </tr>
                </thead>
                <tbody>
                  {previewQueue.map((track: Music, index: number) => (
                    <tr key={index}>
                      <td
                        className='text-light'
                        style={{ backgroundColor: '#000000', borderBottom: 'none' }}
                        >
                          {track.name}
                      </td>
                      <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                        {track.artists.map((artist) => artist.name).join(', ')}
                      </td>
                      <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.name} 
                          className='img-thumbnail' 
                          style={{ width: '40px', height: '40px', backgroundColor: '#000000'}} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          <Button onClick={() => navigate(redirectLink) }>Ver fila completa</Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default QueuePreview;