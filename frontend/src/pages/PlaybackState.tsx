import React from 'react';
import PlayingNow from '../types/PlayingNow';
import { Card, Button, Container } from 'react-bootstrap';

type Props = {
  playingNow: PlayingNow | null;
  isOwner: boolean;
}

const PlaybackState: React.FC<Props> = ({ playingNow, isOwner }) => {
  return (
    <Container className="py-4">
      <Card className="text-center">
        <Card.Body>
          <Card.Title>Reproduzindo agora:</Card.Title>
          {playingNow && playingNow.is_playing && playingNow.currently_playing_type === 'track' ? (
            <div>
              <Card.Img 
                src={playingNow.item.album.images.length > 0 ? playingNow.item.album.images[0].url : 'url_de_backup'} 
                alt={playingNow.item.album.name} 
                className="img-fluid"
                style={{ maxWidth: '200px', maxHeight: '200px', width: 'auto', height: 'auto' }} // Estilos para limitar o tamanho da imagem
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
