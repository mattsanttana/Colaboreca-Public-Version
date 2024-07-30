import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DJ from '../types/DJ';
import { Card, ListGroup, ListGroupItem, Button, Container } from 'react-bootstrap';

type Props = {
  djs: DJ[];
  isOwner: boolean;
  trackId: string | undefined;
}

const Podium: React.FC<Props> = ({ djs, isOwner, trackId }) => {
  const navigate = useNavigate();
  const [podium, setPodium] = useState<DJ[]>([]);
  const [preview, setPreview] = useState<DJ[]>([]);

  useEffect(() => {
    const sortedDjs = [...djs].sort((a, b) => b.score - a.score);
    const newPodium = sortedDjs.filter(dj => dj.ranking > 0).slice(0, 3);
    const newPreview = sortedDjs.slice(0, 5); // Inclui todos os DJs, mesmo sem pontos ou ranking
    setPodium(newPodium);
    setPreview(newPreview);
  }, [djs]);

  const handleClick = () => {
    if (isOwner) {
      navigate(`/track-info/djs/${ trackId }`);
    } else {
      navigate(`/track/ranking/${ trackId }`);
    }
  }

  return (
    <Container className="py-4">
      <Card className="text-center">
        <Card.Body>
          <Card.Title>Pódio:</Card.Title>
          { podium.length > 0 ? (
            <div>
              <ListGroup variant="flush">
                { podium.map((dj: DJ) => (
                  <ListGroupItem key={ dj.id }>
                    <div className="d-flex justify-content-center align-items-center">
                      <div className="rank-square-short">{dj?.ranking || '-'}</div>
                      <div className="name-square-short mx-3">{dj?.djName}</div>
                      <div className="points-square-short">{dj?.score} pts</div>
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </div>
          ) : (
            <div>
              <p>{ isOwner ? 'Ninguém alcançou o pódio ainda' : 'Ninguém alcançou o pódio ainda, adicione músicas à fila e seja o primeiro' }</p>
            </div>
          )}
          <Card.Title>DJs na sala:</Card.Title>
          { preview.length > 0 ? (
            <ListGroup variant="flush">
              { preview.map((dj: DJ) => (
                <ListGroupItem key={ dj.id }>
                  <div className="d-flex justify-content-center align-items-center">
                  <img src={ dj?.characterPath } alt={ dj?.djName } className='short-character' style={{ margin: '15px'}} />
                    <div className="rank-square-short">{dj?.ranking || '-'}</div>
                    <div className="name-square-short mx-3">{dj?.djName}</div>
                    <div className="points-square-short">{dj?.score} pts</div>
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <div>
              <p>Nenhum DJ na sala ainda</p>
            </div>
          )}
          <Button onClick={ handleClick } variant="primary" className="mt-3">
            { isOwner ? 'Ver todos os DJs' : 'Ver ranque' }
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Podium;
