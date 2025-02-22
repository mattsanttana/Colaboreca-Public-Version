import React, { useState, useEffect, useRef, useCallback, lazy, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { io } from 'socket.io-client';
import { RootState } from '../redux/store';
import PlaybackState from './PlaybackState';
import Podium from './Podium';
import QueuePreview from './QueuePreview';
import MessagePopup from './MessagePopup';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';
import useVote from '../utils/useVote';
import PlayingNow from '../types/PlayingNow';
import { DJ, DJPlayingNow } from '../types/DJ';
import { Music } from '../types/SpotifySearchResponse';
import { logo } from '../assets/images/characterPath';
import { Vote, voteValues } from '../types/Vote';
import RankingChangePopup from './RankingChangePopup';
import TQueue from '../types/TQueue';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  token: string;
}

const socket = io('http://localhost:3001');

const Track: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const [trackName, setTrackName] = useState('');
  const [dj, setDJ] = useState<DJ>();
  const [djs, setDJs] = useState<DJ[]>([]);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [queue, setQueue] = useState<Music[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [showVotePopup, setShowVotePopup] = useState<boolean | undefined>(false);
  const [showRankChangePopup, setShowRankChangePopup] = useState(false);
  const [previewRank, setPreviewRank] = useState<DJ[]>([]);
  const [votes, setVotes] = useState<Vote | undefined>(undefined);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const djActions = useDJ();
  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const voteActions = useVote();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const interval = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const [fetchedTrack, fetchedDJData] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.getDJData(token)
          ]);

          if (!fetchedDJData?.data.dj) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedTrack?.status === 200) {
            setTrackName(fetchedTrack?.data.trackName);
            setDJs(fetchedDJData?.data.djs);
            setDJ(fetchedDJData?.data.dj);
          } else {
            setPopupMessage('Esta pista não existe');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId && playingNow) {

        // Limpar os votos quando a URI da música atual mudar
        setVotes(undefined);
        setDJPlayingNow(null);

        try {
          const [fetchedVerifyIfDJHasAlreadVoted, fetchedVotes, fetchedDJPlayingNow] = await Promise.all([
            voteActions.verifyIfDJHasAlreadVoted(token),
            voteActions.getAllVotesForThisMusic(trackId, playingNow.item?.uri ?? "dispositivo não conectado"),
            playbackActions.getDJAddedCurrentMusic(trackId)
          ]);

          setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
          setVotes(fetchedVotes);
          setDJPlayingNow(fetchedDJPlayingNow);
          setQueue(fetchedDJPlayingNow?.spotifyQueue?.queue ?? []);
    
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingNow?.item?.uri || '']);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const fetchedPlayingNow = await playbackActions.getState(trackId)

          setPlayingNow(fetchedPlayingNow);
          
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    interval.current = window.setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingNow?.item?.uri || '']);

  const closeMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  useEffect(() => {
    const handleTrackUpdated = (updatedTrack: { trackName: string }) => { 
      setTrackName(updatedTrack.trackName);
    }

    const handleTrackDeleted = (data: { trackId: number }) => {
      if (Number(trackId) === Number(data.trackId)) {
        setPopupMessage('Esta pista foi deletada');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      }
    };
  
    const handleDJCreated = (data: { dj: DJ }) => {
      setDJs((prevDJs) => [...prevDJs, data.dj]);
    };

    const handleDJUpdated = (updatedDJ: DJ) => {
      // Atualiza o DJ atual (se aplicável)
      setDJ((currentDJ) => {
        if (currentDJ?.id === updatedDJ.id && updatedDJ.ranking < currentDJ.ranking) {
          setPreviewRank(djs); // Atualiza o estado previewRank
          setDJs((prevDJs) =>
            prevDJs.map((dj) => {
              if (Number(dj.id) === Number(updatedDJ.id)) {
                return updatedDJ; // Substitui o DJ pelo atualizado
              }
              return dj; // Mantém o DJ atual
            })
          );
          setShowRankChangePopup(true); // Exibe o popup de mudança de ranking
          return updatedDJ; // Atualiza o DJ atual
        } else {
           // Atualiza a lista de DJs
          setDJs((prevDJs) =>
            prevDJs.map((dj) => {
              if (Number(dj.id) === Number(updatedDJ.id)) {
                return updatedDJ; // Substitui o DJ pelo atualizado
              }
              return dj; // Mantém o DJ atual
            })
          );
        }
        return currentDJ; // Mantém o DJ atual
      });
    };
    
    const handleDJDeleted = (data: { id: number}) => {  
      if (Number(dj?.id) === Number(data.id)) {
        setPopupMessage('Você foi removido desta pista');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      } else {
        // Atualiza a lista de DJs removendo o DJ deletado
        setDJs((prevDJs) => prevDJs.filter((dj) => Number(dj.id) !== Number(data.id)));
      }
    };

    const handleNewVote = (data: { vote: voteValues }) => {
      setVotes((prevVotes) => {
        if (!prevVotes || !prevVotes.voteValues) {
          return { voteValues: [data.vote] };
        }
        return { voteValues: [...prevVotes.voteValues, data.vote] };
      });
    };

    const handleQueueUpdated = (data: { queue: TQueue[], spotifyQueue: Music[]}) => {
      setQueue(data.spotifyQueue);
    };

    socket.emit('joinRoom', `track_${trackId}`);
    socket.on('track updated', handleTrackUpdated);
    socket.on('track deleted', handleTrackDeleted);
    socket.on('dj created', handleDJCreated);
    socket.on('dj updated', handleDJUpdated);
    socket.on('dj deleted', handleDJDeleted);
    socket.on('new vote', handleNewVote);
    socket.on('queue updated', handleQueueUpdated);

    if (socket.connected && dj) {
      socket.emit('joinRoom', `track_${trackId}`);
    }
  
    return () => {
      socket.off('track deleted', handleTrackDeleted);
      socket.off('dj created', handleDJCreated);
      socket.off('dj updated', handleDJUpdated);
      socket.off('dj deleted', handleDJDeleted);
      socket.off('new vote', handleNewVote);
      socket.off('queue updated', handleQueueUpdated);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj]);

  // Funções para lidar com o toque
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    // Calcula a distância de deslocamento horizontal
    const distance = touchEndX - touchStartX;
    
    // Define o valor mínimo para considerar um swipe
    if (distance > 20) {
      setIsMenuOpen(true); // Abre o menu se o deslize for da esquerda para a direita
    }

    if (distance < -20) {
      setIsMenuOpen(false); // Fecha o menu se o deslize for da direita para a esquerda
    }
  };

  const memoizedDJs = useMemo(() => djs, [djs]);
  const memoizedQueue = useMemo(() => queue, [queue]);

  const handleClosePopup = () => {
    setShowRankChangePopup(false);
  };

  return (
    <div
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      <MessagePopup
        show={showPopup}
        handleClose={() => setShowPopup(false)}
        message={popupMessage}
        redirectTo={redirectTo}
      />
      {isLoading ? (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <img src={logo} alt="Loading Logo" className="logo-spinner" />
        </Container>
      ) : (
        <>
          <Container>
            <Header dj={dj} isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen}/>
            <Row>
              <Col md={3} className="d-none d-xxl-block">
                <Menu dj={dj} />
              </Col>
              <Col md={12} lg={12} xl={12} xxl={6} className="d-flex flex-column align-items-center playback-state-container">
                <PlaybackState playingNow={playingNow} trackName={trackName} dj={dj} djPlayingNow={djPlayingNow} votes={votes} isOwner={false} trackId={trackId} />
              </Col>
              <Col md={3} className="d-none d-xxl-block">
                <div>
                  <Podium
                    dj={dj}
                    djs={memoizedDJs}
                    isOwner={false}
                    trackId={trackId}
                  />
                </div>
                <div className="queue-container">
                  <QueuePreview trackId={trackId} queue={memoizedQueue} />
                </div>
              </Col>
            </Row>
          </Container>
          {showVotePopup && (
            <VotePopup
              showVotePopup={showVotePopup}
              setShowVotePopup={setShowVotePopup} 
              playingNow={playingNow}
              djPlayingNow={djPlayingNow}
            />
          )}
          {showRankChangePopup && dj && (
            <RankingChangePopup
              showRankingChangePopup={showRankChangePopup}
              dj={dj}
              previousRanking={previewRank}
              currentRanking={djs}
              handleClosePopup={handleClosePopup}
            />
          )}
        </>
      )}
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const TrackConnected = connect(mapStateToProps)(Track);

export default TrackConnected;