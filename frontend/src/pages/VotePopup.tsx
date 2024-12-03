import { Button, Card, Modal, Spinner } from "react-bootstrap";
import { djTable } from "../assets/images/characterPath";
import React, { useEffect, useRef, useState } from "react";
import { DJPlayingNow } from "../types/DJ";
import PlayingNow from "../types/PlayingNow";
import { RootState } from "../redux/store";
import { connect } from "react-redux";
import useVote from "../utils/useVote";

interface Props {
  showVotePopup: boolean;
  setShowVotePopup: (show: boolean) => void;
  djPlayingNow: DJPlayingNow | null;
  playingNow: PlayingNow | null;
  token: string;
}

const Vote: React.FC<Props> = ({ showVotePopup, setShowVotePopup, playingNow, djPlayingNow, token }) => {
  const [vote, setVote] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const voteActions = useVote();
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
  }, [playingNow]);

  const handleVoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVote(Number(event.target.value));
  };

  const getLabelClass = (index: number) => {
    return index === vote ? 'highlight' : '';
  };

  const handleVoteSubmit = async () => {
    const voteOptions = ['very_bad', 'bad', 'normal', 'good', 'very_good'];
    
    setIsSubmitting(true);
    try {
      await voteActions.vote(token, playingNow?.item.uri, voteOptions[vote]);
      setShowVotePopup(false);
    } catch (error) {
      console.error('Erro ao enviar voto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal className='custom-modal' show={showVotePopup}>
      <Modal.Header style={{ borderBottom: 'none' }}>
        <Modal.Title>O que você acha da música que {djPlayingNow?.addedBy} está tocando?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{color: '000000'}}>
          <div className="d-flex justify-content-center align-items-center squeres-container">
          <div className="music-square mx-2 hide-scrollbar" ref={containerRef} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>Tocando:</div>
            <div className="music-scroll" ref={scrollRef} style={{ textAlign: 'center' }}>
              {playingNow?.item.name} - {playingNow?.item.artists.map((artist) => artist.name).join(', ')}
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
              src={playingNow && playingNow.item.album.images.length > 0 ? playingNow?.item.album.images[0].url : 'url_de_backup'} 
              alt={playingNow?.item.album.name} 
              className="img-fluid music-inside-table"
            />
          </div>
        </div>
        <div className="thermometer-container">
          <input
            type="range"
            min="0"
            max="4"
            value={vote}
            onChange={handleVoteChange}
            className="thermometer"
          />
          <div className="labels">
            <span className={getLabelClass(0)}>Ninguém merece</span>
            <span className={getLabelClass(1)} style={{marginLeft: '20px'}}>Ruim</span>
            <span className={getLabelClass(2)} style={{marginLeft: '20px'}}>Tanto faz</span>
            <span className={getLabelClass(3)} style={{marginLeft: '50px'}}>Boa</span>
            <span className={getLabelClass(4)} style={{marginRight: '-40px'}}>Hino</span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer style={{ borderTop: 'none' }}>
        <Button onClick={handleVoteSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Enviar Voto'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token,
});

const VotePopup = connect(mapStateToProps)(Vote);

export default VotePopup;