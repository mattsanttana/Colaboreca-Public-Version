import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Table } from 'react-bootstrap';
import usePlayback from '../utils/usePlayback';
import { logo } from '../assets/images/characterPath';

type Queue = {
  addedBy: string;
  characterPath: string;
  cover: string;
  musicName: string;
  artists: string[];
}

type Props = {
  trackId: string | undefined;
}

const QueuePreview: React.FC<Props> = ({ trackId }) => {
  const [queue, setQueue] = useState<Queue[]>([]);

  const playbackActions = usePlayback();

  useEffect(() => {
    const fetchQueue = async () => {
      const response = await playbackActions.getQueue(trackId);
      setQueue(response);
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
        <Card.Body>
          <Card.Title>Fila</Card.Title>
          <div className="table-responsive">
            <Table striped bordered>
              <thead>
                <tr>
                  <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Personagem</th>
                  <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Vulgo</th>
                  <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Música</th>
                  <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Artista</th>
                  <th className={'text-light'} style={{ backgroundColor: '#000000' }}>Capa</th>
                </tr>
              </thead>
              <tbody>
                {previewQueue.map((track: Queue, index: number) => (
                  <tr key={index}>
                    <td className={'text-light'} style={{ backgroundColor: '#000000' }}>
                      <img 
                        src={track.characterPath || logo} 
                        alt={track.musicName} 
                        className='img-thumbnail img-thumbnail-hover' 
                        style={{ width: '50px', height: '50px', cursor: 'pointer', backgroundColor: '#000000' }} 
                      />
                    </td>
                    <td className={'text-light'} style={{ backgroundColor: '#000000' }}>{track.addedBy}</td>
                    <td className={'text-light'} style={{ backgroundColor: '#000000' }}>{track.musicName}</td>
                    <td className={'text-light'} style={{ backgroundColor: '#000000' }}>{track.artists}</td>
                    <td className={'text-light'} style={{ backgroundColor: '#000000' }}>
                      <img 
                        src={track.cover} 
                        alt={track.musicName} 
                        className='img-thumbnail img-thumbnail-hover' 
                        style={{ width: '50px', height: '50px', cursor: 'pointer', backgroundColor: '#000000'}} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Button>Ver fila completa</Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default QueuePreview;
