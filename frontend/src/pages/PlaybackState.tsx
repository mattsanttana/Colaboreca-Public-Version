import React, { useEffect, useRef } from 'react';
import { Card, Container } from 'react-bootstrap';
import PlayingNow from '../types/PlayingNow';
import { DJPlayingNow } from '../types/DJ';
import { djTable } from '../assets/images/characterPath';
import { Vote } from '../types/Vote';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

type Props = {
  playingNow: PlayingNow | null;
  trackName: string;
  dj: DJPlayingNow | null;
  votes: Vote | undefined;
};

const PlaybackState: React.FC<Props> = ({ playingNow, trackName, dj, votes }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <Container className="py-4">
      <Card
        className="text-center"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
      >
        <Card.Body style={{height: '850px', overflow: 'auto' }}>
          {playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track' ? (
            <div style={{padding: '0px'}}>
              <div className="d-flex justify-content-center align-items-center squeres-container">
                <div className="dj-square mx-2 hide-scrollbar">
                  <div style={{ fontWeight: 'bold' }}>Discotecando:</div>
                  <div>{dj?.addedBy === trackName ? '-' : dj?.addedBy}</div>
                </div>
                <div className="track-square mx-2 hide-scrollbar">{trackName}</div>
                <div className="music-square mx-2 hide-scrollbar" ref={containerRef}>
                  <div style={{ fontWeight: 'bold' }}>Tocando:</div>
                  <div className="music-scroll" ref={scrollRef}>
                    {playingNow.item.name} - {playingNow.item.artists.map((artist) => artist.name).join(', ')}
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', width: '370px', height: 'auto', margin: '0 auto' }}>
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
              <div style={{ position: 'relative', width: '370px', height: 'auto', margin: '0 auto' }}>
                <Card.Img
                  src={djTable}
                  alt="DJ table"
                  className="img-fluid dj-table"
                />
              </div>
            </div>
          )}
          <div style={{ marginTop: '20px', height: '350px', marginLeft: '-53px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <XAxis type="number" />
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
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PlaybackState;