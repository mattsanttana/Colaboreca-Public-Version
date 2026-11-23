import '../../styles/tracks/PlaybackState.css';
import { Card, Container } from 'react-bootstrap';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { DJPlayingNow } from '../../types/DJ';
import PlayingNow from '../../types/PlayingNow';
import DJTable from '../djs/DJTable';

const voteItems = [
  { type: 'very_bad', icon: '🤢', label: 'Ninguém merece' },
  { type: 'bad', icon: '😒', label: 'Ruim' },
  { type: 'normal', icon: '😐', label: 'Tanto faz' },
  { type: 'good', icon: '😎', label: 'Boa' },
  { type: 'very_good', icon: '👑', label: 'Hino' },
] as const;

const voteFooterVariants: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.08,
      staggerDirection: -1,
    },
  },
  visible: {
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.13,
    },
  },
};

const voteItemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 360, damping: 24 },
  },
};

// Props recebidas
type Props = {
  djPlayingNow: DJPlayingNow | null; // DJ que está tocando a música atual
  playingNow: PlayingNow | null; // Música que está tocando atualmente
  isTrackOwner: boolean;
  trackName: string; // Nome da pista
  votes: { very_good: number; good: number; normal: number; bad: number; very_bad: number }; // Contadores de votos iniciais
  cardVisible: boolean;
  displayVoteCounts?: { very_good: number; good: number; normal: number; bad: number; very_bad: number };
};

// Componente PlaybackState responsável por exibir o estado de reprodução atual
const PlaybackState: React.FC<Props> = ({
  djPlayingNow, playingNow, isTrackOwner, trackName, votes, cardVisible, displayVoteCounts
}) => {
  
  const counts = displayVoteCounts ?? votes ?? { very_good: 0, good: 0, normal: 0, bad: 0, very_bad: 0 };
  const isSpotifyAddedTrack = Boolean(djPlayingNow?.addedByApp);
  const isSpotifyAfk = !playingNow;
  const isPlaybackPaused = Boolean(playingNow && !playingNow.is_playing);

  // Renderiza o componente PlaybackState
  return (
    // Container principal
    <Container className='py-4'>
      {/* Exibição do estado de reprodução */}
      <Card
        id="playback-state-card" className={`text-center playback-card ${ cardVisible ? 'enter' : '' }` }

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
          <motion.div
            className='vote-footer'
            variants={ voteFooterVariants }
            initial='hidden'
            animate={ cardVisible || isSpotifyAddedTrack || isSpotifyAfk || isPlaybackPaused ? 'visible' : 'hidden' }
          >
            <AnimatePresence mode='wait' initial={ false }>
              { isSpotifyAfk || isPlaybackPaused || isSpotifyAddedTrack ? (
                <motion.p
                  key={ isPlaybackPaused
                    ? 'spotify-paused-note'
                    : isSpotifyAfk
                      ? isTrackOwner ? 'spotify-owner-afk-note' : 'spotify-afk-note'
                      : 'spotify-added-note' }
                  className='vote-unavailable'
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  { isPlaybackPaused
                    ? 'A reprodução está pausada no Spotify. Dê play para retomar a música.'
                    : isSpotifyAfk
                      ? isTrackOwner
                        ? 'O Spotify vinculado a esta pista parou de enviar atualizações. Abra o app do Spotify para retomar a sincronização das informações.'
                        : 'O Spotify do responsável por esta pista não envia atualizações há algum tempo. Por isso, não podemos exibir as informações atualizadas da música atual.'
                      : 'Esta música foi adicionada diretamente pelo Spotify e, por isso, não participa da votação.' }
                </motion.p>
              ) : (
                <motion.div key='vote-counts' className='vote-items' variants={ voteFooterVariants }>
                  { voteItems.map(({ type, icon, label }) => (
                    <motion.div className='vote-item' key={ type } variants={ voteItemVariants }>
                      <span className='vote-icon'>{ icon }</span>
                      <span className='vote-count playback-state-vote-count'>
                        <AnimatePresence initial={ false }>
                          <motion.span className="playback-state-label"
                            key={ counts[type] }

                            initial={{ opacity: 0, y: 6, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            { counts[type] }
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      <span className='vote-label'>{ label }</span>
                    </motion.div>
                  )) }
                </motion.div>
              ) }
            </AnimatePresence>
          </motion.div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlaybackState;  // Exporta o componente PlaybackState
