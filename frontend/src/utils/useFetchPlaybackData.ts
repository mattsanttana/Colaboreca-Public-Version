import { useEffect, useMemo, useRef, useState } from "react";
import PlayingNow from "../types/PlayingNow";
import { Vote, voteValues } from "../types/Vote";
import { DJPlayingNow } from "../types/DJ";
import usePlayback from "./usePlayback";
import useVote from "./useVote";
import { Music } from "../types/SpotifySearchResponse";
import TQueue from "../types/TQueue";
import { useParams } from "react-router-dom";
import socket from './socket';

const useFetchPlaybackData = (djToken: string) => {
  const { trackId, } = useParams(); // Pega o ID da pista da URL
  const initialVoteCounts = { very_good: 0, good: 0, normal: 0, bad: 0, very_bad: 0 }; // Contadores iniciais de votos

  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null); // Estado da música que está tocando
  const [votes, setVotes] = useState<Vote | undefined>(undefined); // Votos da música
  const [displayVoteCounts, setDisplayVoteCounts] = useState<typeof initialVoteCounts>(initialVoteCounts);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null); // DJ que está tocando
  const [showVotePopup, setShowVotePopup] = useState<boolean>(false); // Estado do popup de votação
  const [queue, setQueue] = useState<Music[]>([]); // Fila de músicas
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

  const playbackActions = usePlayback(); // Ações de reprodução
  const voteActions = useVote(); // Ações de votação
  const interval = useRef<number | null>(null); // Ref para o intervalo de atualização
  const clearAnimRef = useRef<number | null>(null);

  const cardVisible = Boolean(djPlayingNow?.addedBy && !djPlayingNow.addedByApp);

  // anima contagem para zero (degradação número a número)
  const animateCountsToZero = (startCounts?: typeof initialVoteCounts) => {
    if (clearAnimRef.current) {
      clearInterval(clearAnimRef.current);
      clearAnimRef.current = null;
    }
    const start = startCounts ?? (votes ? displayVoteCounts : { ...initialVoteCounts });
    const allZero = Object.values(start).every(v => v <= 0);
    if (allZero) {
      setDisplayVoteCounts({ ...initialVoteCounts });
      setVotes(undefined);
      return;
    }

    const stepMs = Number(
      (getComputedStyle(document.documentElement).getPropertyValue('--anim-clear-step') || '80ms')
        .trim()
        .replace('ms', '')
    ) || 80;

    const current = { ...start };
    clearAnimRef.current = window.setInterval(() => {
      let any = false;
      (Object.keys(current) as (keyof typeof current)[]).forEach(k => {
        if (current[k] > 0) { current[k] = current[k] - 1; any = true; }
      });
      setDisplayVoteCounts({ ...current });
      if (!any) {
        if (clearAnimRef.current) {
          clearInterval(clearAnimRef.current);
          clearAnimRef.current = null;
        }
        setVotes(undefined);
      }
    }, stepMs);
  };

  // limpa timer de clear no unmount
  useEffect(() => {
    return () => {
      if (clearAnimRef.current) {
        clearInterval(clearAnimRef.current);
        clearAnimRef.current = null;
      }
    };
  }, []);

  // UseEffect para buscar dados relacionados à música atual, votação e fila de reprodução
  useEffect(() => {
    // Função para buscar dados da música atual
    const fetchData = async () => {
      // Verifica se o ID da pista e a música atual existem
      if (trackId && playingNow) {
        // anima a limpeza dos votos (em vez de cortar seco)
        animateCountsToZero();
        setDJPlayingNow(null);

        // Busca os dados da música atual
        try {
          const [fetchedVerifyIfDJHasAlreadVoted, fetchedVotes, fetchedDJPlayingNow] = await Promise.all([
            voteActions.verifyIfDJHasAlreadVoted(djToken), // Verifica se o DJ já votou
            voteActions.getAllVotesForThisMusic(Number(trackId), playingNow.item?.uri ?? 'dispositivo não conectado'), // Busca todos os votos para a música atual
            playbackActions.getDJAddedCurrentMusic(Number(trackId)) // Busca o DJ que adicionou a música atual
          ]);

          setShowVotePopup(playingNow.is_playing ? fetchedVerifyIfDJHasAlreadVoted ?? false : false); // Define se o popup de votação deve ser exibido com base na verificação se o DJ já votou
          setVotes(fetchedVotes); // Define os votos da música atual
          setDJPlayingNow(fetchedDJPlayingNow); // Define o DJ que está tocando a música atual
          setQueue(fetchedDJPlayingNow?.spotifyQueue?.queue ?? []); // Define a fila de músicas
    
        } catch (error) {
          console.error('Error fetching data:', error); // Em caso de erro exibe no console
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingNow?.item?.uri || '']); // Adiciona dependência para a URI da música atual para que toda vez que a música mudar, a função seja chamada novamente

  // UseEffect para verificar a o estado do player a cada 10 segundos
  useEffect(() => {
    // Função para buscar o estado do player
    const fetchData = async () => {
      // Verifica se o ID da pista existe
      if (trackId) {
        try {
          const fetchedPlayingNow = await playbackActions.getState(Number(trackId)) // Busca o estado do player
          setPlayingNow(fetchedPlayingNow); // Define o estado do player  
        } catch (error) {
          console.error('Error fetching data:', error); // Em caso de erro exibe no console
        } finally {
          setIsLoading(false); // Define o estado de carregamento como falso
        }
      }
    };

    fetchData(); // Chama a função para buscar o estado do player

    // Define um intervalo para buscar o estado do player a cada 10 segundos
    interval.current = window.setInterval(() => {
      fetchData(); // Chama a função para buscar o estado do player
    }, 10000);

    // Limpa o intervalo quando o componente é desmontado
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const voteCounts = useMemo(() => {
    return (votes && votes.voteValues && votes.voteValues.length > 0)
      ? votes.voteValues.reduce(
          (acc, vote) => {
            acc[vote] = (acc[vote] || 0) + 1;
            return acc;
          },
          { ...initialVoteCounts }
        )
      : initialVoteCounts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes]);

  // sincroniza display com voteCounts (exceto se estamos animando o clear)
  useEffect(() => {
    if (!clearAnimRef.current) {
      setDisplayVoteCounts(voteCounts);
    }
  }, [voteCounts]);

  // UseEffect para lidar com eventos do socket
  useEffect(() => {
    // Verifica se o socket está conectado e se o DJ existe
    if (socket.connected) {
      socket.emit('joinRoom', `track_${ trackId }`); // Entra na sala da pista
    }

    // Socket que recebe a informação de que um novo voto foi adicionado
    const handleNewVote = (data: { vote: voteValues }) => {
      // Se estivermos no meio da animação de limpar contagens, cancele-a
      if (clearAnimRef.current) {
        clearInterval(clearAnimRef.current);
        clearAnimRef.current = null;
      }

      // Atualiza a lista de votos (fonte de verdade)
      setVotes((prevVotes) => {
        if (!prevVotes || !prevVotes.voteValues) {
          // atualiza contagem exibida imediatamente para evitar "piscar"
          setDisplayVoteCounts(prev => ({ ...prev, [data.vote]: (prev[data.vote as keyof typeof prev] || 0) + 1 }));
          return { voteValues: [data.vote] };
        }

        // atualiza contagem exibida imediatamente
        setDisplayVoteCounts(prev => ({ ...prev, [data.vote]: (prev[data.vote as keyof typeof prev] || 0) + 1 }));
        return { voteValues: [...prevVotes.voteValues, data.vote] };
      });
    };

    // Socket que recebe a informação de que a fila foi atualizada
    const handleQueueUpdated = (data: { queue: TQueue[], spotifyQueue: Music[] }) => {
      setQueue(data.spotifyQueue); // Atualiza a fila de músicas
    };

    socket.on('new vote', handleNewVote);
    socket.on('queue updated', handleQueueUpdated);
  
    // Limpa os eventos do socket quando o componente é desmontado
    return () => {
      socket.off('new vote', handleNewVote);
      socket.off('queue updated', handleQueueUpdated);
    };

  // Adiciona dependência para o DJ atual para que caso quando o componente seja montado e o dj ainda não tenha sido definido o UseEffect seja executado
  // de novo quando o DJ for definido
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    playingNow,
    initialVoteCounts,
    djPlayingNow,
    showVotePopup,
    setShowVotePopup,
    queue,
    isLoading,
    cardVisible,
    displayVoteCounts,
  };
};

export default useFetchPlaybackData;