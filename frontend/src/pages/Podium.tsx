import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container } from 'react-bootstrap';
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
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', top: '60px' }}
      >
        <Card.Body className='hide-scrollbar' style={{ height: '400px', overflow: 'auto'}}>
          <div style={{ position: 'relative', width: '370px', height: 'auto', margin: '0 auto' }}></div>
          <img src={podium} alt="podium" className='podium-img' />
          {djPodium.length > 0 ? (
            <div>
              {djPodium[0] && (
                <div>
                  <p className="text-light mt-3 name-rank-1">1º <br />{djPodium[0].djName}</p>
                  <Card.Img
                    key={djPodium[0].id}
                    src={djPodium[0].characterPath}
                    alt={djPodium[0].djName}
                    className="img-fluid dj-character-podium-rank-1"
                  />
                </div>
              )}
              {djPodium[1] && (
                <div>
                  <p className="text-light mt-3 name-rank-2">2º <br />{djPodium[1].djName}</p>
                  <Card.Img
                    key={djPodium[1].id}
                    src={djPodium[1].characterPath}
                    alt={djPodium[1].djName}
                    className="img-fluid dj-character-podium-rank-2"
                  />
                </div>
              )}
              {djPodium[2] && (
                <div>
                  <p className="text-light mt-3 name-rank-3">3º <br />{djPodium[2].djName}</p>
                  <Card.Img
                    key={djPodium[2].id}
                    src={djPodium[2].characterPath}
                    alt={djPodium[2].djName}
                    className="img-fluid dj-character-podium-rank-3"
                  />
                </div>
              )}
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