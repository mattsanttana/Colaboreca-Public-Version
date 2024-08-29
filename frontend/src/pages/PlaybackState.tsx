import React, { useEffect, useState } from 'react';
import { Card, Container } from 'react-bootstrap';
import PlayingNow from '../types/PlayingNow';
import { djTable } from '../assets/images/characterPath';
import { useParams } from 'react-router-dom';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';

type Props = {
  playingNow: PlayingNow | null;
}

type DJ = {
  addedBy: string;
  characterPath: string;
}

const PlaybackState: React.FC<Props> = ({ playingNow }) => {
  const { trackId } = useParams();
  const [trackName, setTrackName] = useState('');
  const [dj, setDJ] = useState<DJ | null>(null);
  
  const trackActions = useTrack();
  const playbackActions = usePlayback();

  useEffect(() => {
    const fetchTrack = async () => {
      if (trackId) {
        try {
          const [fetchedTrack, fetchedQueue] = await Promise.all([
            trackActions.getTrackById(trackId),
            playbackActions.getDJAddedCurrentMusic(trackId),
          ]);
  
          if (fetchedTrack?.status === 200) {
            setTrackName(fetchedTrack.data.trackName);
          }
  
          if (fetchedQueue) {
            setDJ(fetchedQueue);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
  
    fetchTrack();
  }, [trackActions, playbackActions, trackId]);

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
                <div className="music-square mx-2 hide-scrollbar">
                  <div style={{ fontWeight: 'bold' }}>Tocando:</div>
                  <div>{playingNow.item.name}</div>
                  <div>
                    <Card.Text style={{ margin: '2px 0' }}>
                      {playingNow.item.artists.map((artist: { id: string; name: string }) => artist.name).join(', ')}
                    </Card.Text>
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
                <div className="music-square mx-2 hide-scrollbar">
                  <div style={{ fontWeight: 'bold' }}>Tocando:</div>
                  <div>Nenhuma música tocando</div>
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