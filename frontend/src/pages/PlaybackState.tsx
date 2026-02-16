import { Card, Container } from 'react-bootstrap';
import { DJPlayingNow } from '../types/DJ';
import PlayingNow from '../types/PlayingNow';
import DJTable from './DJTable';

// Props recebidas
type Props = {
  djPlayingNow: DJPlayingNow | null; // DJ que está tocando a música atual
  pulsingVote: string | null; // Voto pulsante
  playingNow: PlayingNow | null; // Música que está tocando atualmente
  trackName: string; // Nome da pista
  votes: { very_good: number; good: number; normal: number; bad: number; very_bad: number }; // Contadores de votos iniciais
  revealPulse: string | null;
  cardVisible: boolean;
  revealedVotes: Record<string, boolean>;
  hidePulse?: string | null;
  displayVoteCounts?: { very_good: number; good: number; normal: number; bad: number; very_bad: number };
};

// Componente PlaybackState responsável por exibir o estado de reprodução atual
const PlaybackState: React.FC<Props> = ({
  djPlayingNow, playingNow, pulsingVote, trackName, votes, revealPulse, cardVisible, revealedVotes, hidePulse, displayVoteCounts
}) => {
  
  const counts = displayVoteCounts ?? votes ?? { very_good: 0, good: 0, normal: 0, bad: 0, very_bad: 0 };

  // Renderiza o componente PlaybackState
  return (
    // Container principal
    <Container className='py-4'>
      {/* Exibição do estado de reprodução */}
      <Card
        className={`text-center playback-card ${ cardVisible ? 'enter' : '' }` }
         style={{
           boxShadow: '0 0 0 0.5px #ffffff',
           padding: '0'
         }}
       >
        { /* Corpo do card com imagem de fundo */}
        <Card.Body>
          { /* Renderiza a mesa de DJ com as informações do DJ atual e da música tocando */ }
          <DJTable 
            djPlayingNow={ djPlayingNow } // DJ que está tocando a música atual
            playingNow={ playingNow } // Música que está tocando atualmente
            showAddedByandTrackName={ true } // Exibe o nome do DJ e da pista
            trackName={ trackName } // Nome da pista
          />
          {/* Rodapé com contadores de votos estilizado como post */}
          <div className='vote-footer'>
            <div className={`vote-item ${ revealedVotes['very_bad'] ? 'revealed' : '' } ${ (pulsingVote === 'very_bad' || revealPulse === 'very_bad') ? 'pulse' : '' } ${ hidePulse === 'very_bad' ? 'hiding' : '' }` }>
              <span className='vote-icon'>🤢</span>
              <span className='vote-count'>{ counts.very_bad }</span>
              <span className='vote-label'>Ninguém merece</span>
            </div>
            <div className={`vote-item ${ revealedVotes['bad'] ? 'revealed' : '' } ${ (pulsingVote === 'bad' || revealPulse === 'bad') ? 'pulse' : '' } ${ hidePulse === 'bad' ? 'hiding' : '' }` }>
              <span className='vote-icon'>😒</span>
              <span className='vote-count'>{ counts.bad }</span>
              <span className='vote-label'>Ruim</span>
            </div>
            <div className={`vote-item ${ revealedVotes['normal'] ? 'revealed' : '' } ${ (pulsingVote === 'normal' || revealPulse === 'normal') ? 'pulse' : '' } ${ hidePulse === 'normal' ? 'hiding' : '' }` }>
              <span className='vote-icon'>😐</span>
              <span className='vote-count'>{ counts.normal }</span>
              <span className='vote-label'>Tanto faz</span>
            </div>
            <div className={`vote-item ${ revealedVotes['good'] ? 'revealed' : '' } ${ (pulsingVote === 'good' || revealPulse === 'good') ? 'pulse' : '' } ${ hidePulse === 'good' ? 'hiding' : '' }` }>
              <span className='vote-icon'>😎</span>
              <span className='vote-count'>{ counts.good }</span>
              <span className='vote-label'>Boa</span>
            </div>
            <div className={`vote-item ${ revealedVotes['very_good'] ? 'revealed' : '' } ${ (pulsingVote === 'very_good' || revealPulse === 'very_good') ? 'pulse' : '' } ${ hidePulse === 'very_good' ? 'hiding' : '' }` }>
              <span className='vote-icon'>👑</span>
              <span className='vote-count'>{ counts.very_good }</span>
              <span className='vote-label'>Hino</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlaybackState;  // Exporta o componente PlaybackState