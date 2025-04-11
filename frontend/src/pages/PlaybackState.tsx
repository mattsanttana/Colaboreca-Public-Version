import React, { useEffect, useRef } from 'react';
import { Button, Card, Container, OverlayTrigger, Popover } from 'react-bootstrap';
import PlayingNow from '../types/PlayingNow';
import { DJ, DJPlayingNow } from '../types/DJ';
import { djTable, djTablePlaying } from '../assets/images/characterPath';
import { Vote } from '../types/Vote';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

type Props = {
  playingNow: PlayingNow | null;
  trackName: string;
  dj: DJ | undefined;
  djPlayingNow: DJPlayingNow | null;
  votes: Vote | undefined;
  isOwner: boolean;
  trackId: string | undefined;
};

const PlaybackState: React.FC<Props> = ({ playingNow, trackName, dj, djPlayingNow, votes, isOwner, trackId }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const containerElement = containerRef.current;
  
    if (scrollElement && containerElement) {
      const scrollWidth = scrollElement.scrollWidth;
      const containerWidth = containerElement.clientWidth;
      
      const isPlaying = playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track';
      const scrollAmount = scrollWidth - containerWidth + 20;
      
      // Verifica se a música está tocando ou se o texto é maior que o container (para a mensagem de "Nenhuma música tocando")
      if ((isPlaying || scrollWidth > containerWidth) && scrollWidth > containerWidth) {
        scrollElement.style.animation = `scroll-text ${scrollAmount / 15}s linear infinite`;
        scrollElement.style.setProperty('--scroll-distance', `-${scrollAmount}px`);
      } else {
        scrollElement.style.animation = 'none';
      }
    }
  }, [playingNow, trackName]);
  

  // Contagem dos votos
  const initialVoteCounts = { very_good: 0, good: 0, normal: 0, bad: 0, very_bad: 0 };

  const voteCounts = (votes && votes.voteValues && votes.voteValues.length > 0) ? votes.voteValues.reduce(
    (acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    },
    initialVoteCounts
  ) : initialVoteCounts;
  

  // Dados para o gráfico
  const data = [
    { name: 'Hino', value: voteCounts.very_good },
    { name: 'Boa', value: voteCounts.good },
    { name: 'Tanto faz', value: voteCounts.normal },
    { name: 'Ruim', value: voteCounts.bad },
    { name: 'Ninguém merece', value: voteCounts.very_bad },
  ];

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

  const renderPopover = (pDJ: DJPlayingNow | null) => (
    <Popover id={`popover-${pDJ?.djId}`} style={{ marginBottom: '-80px' }}>
      <Popover.Body>
        <Button variant="link" onClick={() => handleViewProfile(String(pDJ?.djId))}>Perfil</Button>
        {(!isOwner && Number(pDJ?.djId) !== Number(dj?.id)) && (
          <Button variant="link" onClick={() => handleStartChat(String(pDJ?.djId))}>Papinho</Button>
        )}
      </Popover.Body>
    </Popover>
  );
  

  return (
    <Container className="py-4">
      <Card
        className="text-center"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
      >
        <Card.Body className='card-body-playback'>
          {playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track' ? (
            <div style={{padding: '0px'}}>
              <div className="d-flex justify-content-center align-items-center squeres-container">
                <div className="dj-square mx-2 hide-scrollbar">
                  <div style={{ fontWeight: 'bold' }}>Discotecando:</div>
                  <div>{djPlayingNow?.addedBy === undefined ? '-' : djPlayingNow?.addedBy}</div>
                </div>
                <div className="track-square mx-2 hide-scrollbar">{trackName}</div>
                <div className="music-square mx-2 hide-scrollbar" ref={containerRef}>
                  <div style={{ fontWeight: 'bold' }}>Tocando:</div>
                  <div className="music-scroll" ref={scrollRef}>
                    {playingNow?.item?.name} - {playingNow?.item?.artists?.map((artist) => artist.name).join(', ')}
                  </div>
                </div>
              </div>
              { (djPlayingNow?.addedBy === undefined) ? (
              <div className='dj-table-container'>
                <Card.Img
                  src={djTable}
                  alt="DJ table"
                  className="img-fluid dj-table"
                />
                <Card.Img 
                  src={playingNow.item.album.images.length > 0 ? playingNow.item.album.images[0].url : 'url_de_backup'} 
                  alt={playingNow.item.album.name} 
                  className="img-fluid music-inside-table"
                />
              </div>
              ) : (
                <OverlayTrigger
                  trigger="click"
                  placement="top"
                  overlay={renderPopover(djPlayingNow)}
                  rootClose
                >
                  <div className='dj-table-container'>
                    <Card.Img
                      src={djPlayingNow?.characterPath}
                      alt="DJ character"
                      className="img-fluid dj-character-inside-table dj-dancing"
                    />
                    <Card.Img
                      src={djTablePlaying}
                      alt="DJ table"
                      className="img-fluid dj-table"
                    />
                    <Card.Img 
                      src={playingNow.item.album.images.length > 0 ? playingNow.item.album.images[0].url : 'url_de_backup'} 
                      alt={playingNow.item.album.name} 
                      className="img-fluid music-inside-table"
                  />
                </div>
              </OverlayTrigger>
              )}
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-center align-items-center squeres-container">
                <div className="dj-square mx-2 hide-scrollbar">
                  <div style={{ fontWeight: 'bold' }}>Discotecando:</div>
                  <div>-</div>
                </div>
                <div className="track-square mx-2 hide-scrollbar">{trackName}</div>
                <div className="music-square mx-2 hide-scrollbar" ref={containerRef}>
                  <div style={{ fontWeight: 'bold' }}>Tocando:</div>
                  <div className="music-scroll" ref={scrollRef}>
                    Nenhuma música tocando
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', width: '370px', height: 'auto', margin: '0 auto', top: '50px' }}>
                <Card.Img
                  src={djTable}
                  alt="DJ table"
                  className="img-fluid dj-table"
                />
                <FaExclamationTriangle className="exclamation-inside-table" style={{ width: '60px' }} />
              </div>
            </div>
          )}
          {playingNow && playingNow.is_playing && (
            <div>
              <div className="music-notes-animation-top-left">
                <span className="music-note">♪</span>
                <span className="music-note">♫</span>
                <span className="music-note">♬</span>
              </div>
              <div className="music-notes-animation-top-right">
                <span className="music-note">♪</span>
                <span className="music-note">♫</span>
                <span className="music-note">♬</span>
              </div>
              <div className="music-notes-animation-bottom-left">
                <span className="music-note">♪</span>
                <span className="music-note">♫</span>
                <span className="music-note">♬</span>
              </div>
              <div className="music-notes-animation-bottom-right">
                <span className="music-note">♪</span>
                <span className="music-note">♫</span>
                <span className="music-note">♬</span>
              </div>
            </div>
          )}
          {data.some((item) => item.value > 0) && (
            <div className='bar-chart'>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <XAxis 
                    type="number" 
                    domain={[0, 'dataMax']} // Define o intervalo de 0 até o valor máximo nos dados
                    allowDecimals={false} // Não permite números decimais
                  />
                  <YAxis
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 15 }}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PlaybackState; 