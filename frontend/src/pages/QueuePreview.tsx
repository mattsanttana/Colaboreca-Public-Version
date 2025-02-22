import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Table } from 'react-bootstrap';
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
  }, []);

  const redirectLink = isOwner ? `/track-info/queue/${ trackId }` : `/track/queue/${ trackId }`;

  const previewQueue = Array.isArray(queue) ? queue.slice(0, 3) : [];

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <Container className="py-4" onClick={() => navigate(redirectLink) } style={{ cursor: 'pointer' }}>
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
      >
        <Card.Body 
          style={{ 
            height: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'  
            }}
            className='hide-scrollbar' 
          >
            <Card.Title>Fila:</Card.Title>
            <Table
              striped
              style={{
                tableLayout: 'auto',
                width: '100%',
                wordWrap: 'break-word',
              }}
            >
              <thead>
                <tr>
                  <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none'}}>Música</th>
                  <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Artista</th>
                  <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Capa</th>
                </tr>
              </thead>
              <tbody>
                {previewQueue.map((track: Music, index: number) => (
                  <tr key={index}>
                    <td
                      className='text-light'
                      style={{ 
                        backgroundColor: '#000000',
                        borderBottom: 'none',
                        maxWidth: '100px',
                        wordWrap: 'break-word',
                      }}
                    >
                      { truncateText(track.name, 23) }
                    </td>
                    <td
                      className='text-light'
                      style={{ 
                        backgroundColor: '#000000',
                        borderBottom: 'none',
                        maxWidth: '100px',
                        wordWrap: 'break-word',
                      }}
                    >
                      { truncateText(track.artists.map((artist) => artist.name).join(', '), 23) }
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
        </Card.Body>
      </Card>
    </Container>
  )
}

export default QueuePreview;