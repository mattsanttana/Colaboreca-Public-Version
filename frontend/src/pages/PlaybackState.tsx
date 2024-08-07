import React from 'react';
import { Card, Button, Container } from 'react-bootstrap';
import PlayingNow from '../types/PlayingNow';

type Props = {
  playingNow: PlayingNow | null;
  isOwner: boolean;
}

const PlaybackState: React.FC<Props> = ({ playingNow, isOwner }) => {
  return (
    <Container className="py-4">
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff', padding: '0' }}
      >
        <Card.Body>
          <Card.Title>Reproduzindo agora:</Card.Title>
          {playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track' ? (
            <div>
              <Card.Img 
                src={
                  playingNow.item.album.images.length > 0 ?
                  playingNow.item.album.images[0].url : 'url_de_backup'
                } 
                alt={playingNow.item.album.name} 
                className="img-fluid"
                style={{ maxWidth: '200px', maxHeight: '200px', width: 'auto', height: 'auto' }}
              />
              <Card.Text>{playingNow.item.name}</Card.Text>
              {playingNow.item.artists.map((artist: { id: string; name: string }) => (
                <Card.Text key={artist.id}>{artist.name}</Card.Text>
              ))}
            </div>
          ) : (
            isOwner ? (
              <Card.Text>Nenhuma música está sendo reproduzida no momento.</Card.Text>
            ) : (
              <div>
                <Card.Text>Nada tocando no momento, adicionar música à fila?</Card.Text>
                <Button variant="primary">Adicionar música à fila</Button>
              </div>
            )
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PlaybackState;