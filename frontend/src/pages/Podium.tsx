import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, ListGroup, ListGroupItem, Button, Container } from 'react-bootstrap';
import { DJ } from '../types/DJ';
import { podium } from '../assets/images/characterPath';

type Props = {
  djs: DJ[];
  isOwner: boolean;
  trackId: string | undefined;
  hasDJs: boolean;
}

const Podium: React.FC<Props> = ({ djs, isOwner, trackId, hasDJs }) => {
  const navigate = useNavigate();
  const [djPodium, setPodium] = useState<DJ[]>([]);
  const [isRankingPage, setIsRankingPage] = useState(false);

  useEffect(() => {
    const pageType = window.location.pathname.split('/')[2];

    if (pageType === 'ranking') {
      setIsRankingPage(true);
    }
  }, []);

  useEffect(() => {
    const sortedDJs = [...djs].sort((a, b) => b.score - a.score);
    const newPodium = sortedDJs.filter(dj => dj.ranking > 0).slice(0, 3);
    setPodium(newPodium);
  }, [djs]);

  const handleClick = () => {
    if (isOwner) {
      navigate(`/track-info/djs/${trackId}`);
    } else {
      navigate(`/track/ranking/${trackId}`);
    }
  }

  return (
    <Container className="py-4">
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
      >
        <Card.Body className='hide-scrollbar' style={{ height: '400px', overflow: 'auto' }}>
          <img src={podium} alt="podium" className='podium-img' />
          {djPodium.length > 0 ? (
            <div>
              <ListGroup variant="flush">
                {djPodium.map((dj: DJ) => (
                  <ListGroupItem key={dj.id}>
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
              <p>
                {isOwner ? 'Ninguém alcançou o pódio ainda' :
                  'Ninguém alcançou o pódio ainda, adicione músicas à fila e seja o primeiro'}
              </p>
            </div>
          )}
          <div>
            {hasDJs && !isRankingPage && (
              <Button onClick={handleClick} variant="primary" className="mt-3">
                {isOwner ? 'Ver todos os DJs' : 'Ver ranque'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Podium;