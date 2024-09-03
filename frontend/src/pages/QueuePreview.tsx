import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Table } from 'react-bootstrap';
import { Music } from '../types/SpotifySearchResponse';

type Props = {
  trackId: string | undefined;
  queue: Music[] | undefined;
}

const QueuePreview: React.FC<Props> = ({ trackId, queue }) => {
  const navigate = useNavigate();

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
                    <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Música</th>
                    <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Artista</th>
                    <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Capa</th>
                  </tr>
                </thead>
                <tbody>
                  {previewQueue.map((track: Music, index: number) => (
                    <tr key={index}>
                      <td className={'text-light'} style={{ backgroundColor: '#000000' }}>{track.name}</td>
                      <td className={'text-light'} style={{ backgroundColor: '#000000' }}>
                        {track.artists.map((artist) => artist.name).join(', ')}
                      </td>
                      <td className={'text-light'} style={{ backgroundColor: '#000000' }}>
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
          <Button onClick={() => navigate(`/track/queue/${ trackId }`) }>Ver fila completa</Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default QueuePreview;