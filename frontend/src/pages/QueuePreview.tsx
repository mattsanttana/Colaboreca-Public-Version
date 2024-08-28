import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Table, Spinner } from 'react-bootstrap';
import usePlayback from '../utils/usePlayback';
import TQueue from '../types/TQueue';

type Props = {
  trackId: string | undefined;
}

const QueuePreview: React.FC<Props> = ({ trackId }) => {
  const [queue, setQueue] = useState<TQueue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const playbackActions = usePlayback();

  useEffect(() => {
    const fetchQueue = async () => {
      const response = await playbackActions.getQueue(trackId);
      setQueue(response);
      setIsLoading(false);
    }

    fetchQueue();
  }, [playbackActions, trackId]);

  const previewQueue = Array.isArray(queue) ? queue.slice(0, 5) : [];

  return (
    <Container className="py-4">
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
      >
        <Card.Body className='hide-scrollbar' style={{height: '400px', overflow: 'auto'}}>
          <Card.Title>Fila:</Card.Title>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          ) : (
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
                  {previewQueue.map((track: TQueue, index: number) => (
                    <tr key={index}>
                      <td className={'text-light'} style={{ backgroundColor: '#000000' }}>{track.musicName}</td>
                      <td className={'text-light'} style={{ backgroundColor: '#000000' }}>{track.artists}</td>
                      <td className={'text-light'} style={{ backgroundColor: '#000000' }}>
                        <img 
                          src={track.cover} 
                          alt={track.musicName} 
                          className='img-thumbnail' 
                          style={{ width: '50px', height: '50px', backgroundColor: '#000000'}} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          <Button onClick={() => navigate(`/track/queue/${ trackId }`) }>Ver fila completa</Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default QueuePreview;