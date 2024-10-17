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
  }, []);

  const redirectLink = isOwner ? `/track-info/queue/${ trackId }` : `/track/queue/${ trackId }`;

  const previewQueue = Array.isArray(queue) ? queue.slice(0, 3) : [];

  return (
    <Container className="py-4">
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
      >
        {/* Adicionar flexbox para o Body do Card */}
        <Card.Body 
          style={{ 
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',        // Mantém a rolagem para o conteúdo grande      // Remove rolagem horizontal
              scrollbarWidth: 'none',   // Firefox: Esconde barras de rolagem
              msOverflowStyle: 'none'   // IE e Edge: Esconde barras de rolagem
            }}
            className='hide-scrollbar'  // Adiciona classe para browsers WebKit
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
                      style={{ 
                        backgroundColor: '#000000',
                        borderBottom: 'none',
                        maxWidth: '150px',
                        wordWrap: 'break-word',
                      }}
                    >
                      {track.name}
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