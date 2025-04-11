import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Popover, OverlayTrigger } from 'react-bootstrap';
import { DJ } from '../types/DJ';
import { podium } from '../assets/images/characterPath';

type Props = {
  dj: DJ | undefined;
  djs: DJ[];
  isOwner: boolean;
  trackId: string | undefined;
}

const Podium: React.FC<Props> = ({ dj, djs, isOwner, trackId }) => {
  const navigate = useNavigate();
  const [djPodium, setPodium] = useState<DJ[]>([]);

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

  const handleViewProfile = (djId: string) => {
    const profileUrl = isOwner
      ? `/track-info/profile/${trackId}/${djId}`
      : `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const handleStartChat = (djId: string) => {
    const chatUrl = `/track/chat/${trackId}/${djId}`;
    navigate(chatUrl);
  }

  const renderPopover = (pDJ: DJ) => (
    <Popover id={`popover-${pDJ.id}`}>
      <Popover.Body>
        <Button variant="link" onClick={() => handleViewProfile(String(pDJ.id))}>Perfil</Button>
        {(!isOwner && pDJ.id !== dj?.id) && (
          <Button variant="link" onClick={() => handleStartChat(String(pDJ.id))}>Papinho</Button>
        )}
      </Popover.Body>
    </Popover>
  );
  

  return (
    <Container className="py-4" onClick={ handleClick } style={{ cursor: 'pointer' }}>
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', top: '60px' }}
      >
        <Card.Body className='hide-scrollbar' style={{ height: '400px', overflow: 'auto'}}>
          <img src={podium} alt="podium" className='podium-img' />
          {djPodium.length > 0 ? (
            <div>
              {djPodium[0] && (
                <div>
                  <p className="text-light mt-3 name-rank-1">{djPodium[0].djName}</p>
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={renderPopover(djPodium[0])}
                    rootClose
                  >
                    <Card.Img
                      key={djPodium[0].id}
                      src={djPodium[0].characterPath}
                      alt={djPodium[0].djName}
                      className="img-fluid dj-character-podium-rank-1"
                      style={{ cursor: 'pointer' }}
                    />
                  </OverlayTrigger>
                </div>
              )}
              { djPodium[1] && (
                <div>
                  <p className="text-light mt-3 name-rank-2">{djPodium[1].djName}</p>
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={renderPopover(djPodium[1])}
                    rootClose
                  >
                    <Card.Img
                      key={djPodium[1].id}
                      src={djPodium[1].characterPath}
                      alt={djPodium[1].djName}
                      className="img-fluid dj-character-podium-rank-2"
                      style={{ cursor: 'pointer' }}
                    />
                  </OverlayTrigger>
                </div>
              )}
              {djPodium[2] && (
                <div>
                  <p className="text-light mt-3 name-rank-3">{djPodium[2].djName}</p>
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={renderPopover(djPodium[2])}
                    rootClose
                  >
                    <Card.Img
                      key={djPodium[2].id}
                      src={djPodium[2].characterPath}
                      alt={djPodium[2].djName}
                      className="img-fluid dj-character-podium-rank-3"
                      style={{ cursor: 'pointer' }}
                    />
                  </OverlayTrigger>
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
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Podium;