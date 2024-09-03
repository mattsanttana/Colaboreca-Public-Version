import React, { useEffect, useRef } from 'react';
import { Card, Container } from 'react-bootstrap';
import PlayingNow from '../types/PlayingNow';
import { djTable } from '../assets/images/characterPath';
import { DJPlayingNow } from '../types/DJ';

type Props = {
  playingNow: PlayingNow | null;
  trackName: string;
  dj: DJPlayingNow | null;
};

const PlaybackState: React.FC<Props> = ({ playingNow, trackName, dj }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const containerElement = containerRef.current;

    if (scrollElement && containerElement) {
      const isPlaying = playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track';
      const scrollWidth = scrollElement.scrollWidth;
      const containerWidth = containerElement.clientWidth;

      if (isPlaying && scrollWidth > containerWidth) {
        // Calcula a diferença para saber quanto precisa rolar
        const scrollAmount = scrollWidth - containerWidth + 20;
        scrollElement.style.animation = `scroll-text ${scrollAmount / 15}s linear infinite`;
        scrollElement.style.setProperty('--scroll-distance', `-${scrollAmount}px`);
      } else {
        scrollElement.style.animation = 'none'; // Remove a animação se o texto couber ou se não houver música tocando
      }
    }
  }, [playingNow]); // Recalcula sempre que 'playingNow' muda

  return (
    <Container className="py-4">
      <Card
        className="text-center"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
      >
        <Card.Body style={{ height: '850px', overflow: 'auto' }}>
          {playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track' ? (
            <div>
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
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PlaybackState;
