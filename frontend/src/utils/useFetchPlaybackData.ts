import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import PlayingNow from "../types/PlayingNow";
import { Vote, voteValues } from "../types/Vote";
import { DJPlayingNow } from "../types/DJ";
import usePlayback from "./usePlayback";
import useVote from "./useVote";
import { Music } from "../types/SpotifySearchResponse";
import TQueue from "../types/TQueue";
import { useParams } from "react-router-dom";

const socket = io('http://localhost:3001'); // Conecta ao servidor WebSocket

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
  const [pulsingVote, setPulsingVote] = useState<string | null>(null);
  const [previousVoteCounts, setPreviousVoteCounts] = useState(initialVoteCounts);
  const [revealPulse, setRevealPulse] = useState<string | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [revealedVotes, setRevealedVotes] = useState<Record<string, boolean>>({});
  const [hidePulse, setHidePulse] = useState<string | null>(null);

  const playbackActions = usePlayback(); // Ações de reprodução
  const voteActions = useVote(); // Ações de votação
  const interval = useRef<number | null>(null); // Ref para o intervalo de atualização
  const prevDjRef = useRef<boolean>(false);
  const timersRefVotes = useRef<number[]>([]);
  const voteOrder = ['very_bad','bad','normal','good','very_good'] as const;
  const clearAnimRef = useRef<number | null>(null);

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

  useEffect(() => {
    const isPlayingDJ = Boolean(djPlayingNow?.addedBy);
    // entrada: monta card e revela votos em sequência
    if (isPlayingDJ && !prevDjRef.current) {
      setCardVisible(true);
      timersRefVotes.current.forEach(clearTimeout);
      timersRefVotes.current = [];

      const startDelay = 600; // espera o card aparecer

      const pulseMs = Number(
        (getComputedStyle(document.documentElement).getPropertyValue('--anim-pulse-duration') || '500ms')
          .trim()
          .replace('ms', '')
      ) || 500;
      const gap = 180;
      const step = pulseMs + gap;

      voteOrder.forEach((v, idx) => {
        const revealAt = startDelay + idx * step;
        const t = window.setTimeout(() => {
          setRevealPulse(v);
          const t2 = window.setTimeout(() => {
            setRevealPulse(null);
            setRevealedVotes(prev => ({ ...prev, [v]: true }));
          }, pulseMs);
          timersRefVotes.current.push(t2);
        }, revealAt);
        timersRefVotes.current.push(t);
      });

    // saída: esconde votos em sequência inversa e depois fecha o card
    } else if (!isPlayingDJ && prevDjRef.current) {
      timersRefVotes.current.forEach(clearTimeout);
      timersRefVotes.current = [];

      const pulseMs = Number(
        (getComputedStyle(document.documentElement).getPropertyValue('--anim-pulse-duration') || '200ms')
          .trim()
          .replace('ms', '')
      ) || 200;
      const gap = 50;
      const step = pulseMs + gap;
      const startDelay = 80; // pequeno atraso antes de começar a esconder

      voteOrder.slice().reverse().forEach((v, idx) => {
        const hideAt = startDelay + idx * step;
        const t = window.setTimeout(() => {
          setHidePulse(v);
          const t2 = window.setTimeout(() => {
            setHidePulse(null);
            setRevealedVotes(prev => {
              const next = { ...prev };
              delete next[v];
              return next;
            });
          }, pulseMs);
          timersRefVotes.current.push(t2);
        }, hideAt);
        timersRefVotes.current.push(t);
      });

      // depois de toda sequência, fechar o card
      const finishAt = startDelay + voteOrder.length * step + 120;
      const tFinish = window.setTimeout(() => {
        setCardVisible(false);
        setRevealPulse(null);
        setHidePulse(null);
        timersRefVotes.current.forEach(clearTimeout);
        timersRefVotes.current = [];
      }, finishAt);
      timersRefVotes.current.push(tFinish);
    }

    prevDjRef.current = isPlayingDJ;
    return () => {
      timersRefVotes.current.forEach(clearTimeout);
      timersRefVotes.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [djPlayingNow?.addedBy]);

  useEffect(() => {
    if (revealPulse) setRevealedVotes(prev => ({ ...prev, [revealPulse]: true }));
  }, [revealPulse]);

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

  // Detectar novo voto e adicionar pulso
  useEffect(() => {
    Object.keys(voteCounts).forEach((voteType) => {
      if (voteCounts[voteType as keyof typeof voteCounts] > previousVoteCounts[voteType as keyof typeof previousVoteCounts]) {
        // Novo voto detectado
        setPulsingVote(voteType);

        // Remover o pulso após 600ms (duração da animação)
        const timer = setTimeout(() => {
          setPulsingVote(null);
        }, 600);

        return () => clearTimeout(timer);
      }
    });

    // Atualizar contagem anterior
    setPreviousVoteCounts(voteCounts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes]);

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
    pulsingVote,
    djPlayingNow,
    showVotePopup,
    setShowVotePopup,
    queue,
    isLoading,
    revealPulse,
    cardVisible,
    revealedVotes,
    hidePulse,
    displayVoteCounts,
  };
};

export default useFetchPlaybackData;