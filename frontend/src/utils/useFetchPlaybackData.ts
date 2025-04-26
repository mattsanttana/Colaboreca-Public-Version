import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import PlayingNow from "../types/PlayingNow";
import { Vote, voteValues } from "../types/Vote";
import { DJPlayingNow } from "../types/DJ";
import usePlayback from "./usePlayback";
import useVote from "./useVote";
import { Music } from "../types/SpotifySearchResponse";
import TQueue from "../types/TQueue";

const socket = io('http://localhost:3001'); // Conecta ao servidor WebSocket

const useFetchPlaybackData = (trackId: string | undefined, djToken: string) => {
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null); // Estado da música que está tocando
  const [votes, setVotes] = useState<Vote | undefined>(undefined); // Votos da música
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null); // DJ que está tocando
  const [showVotePopup, setShowVotePopup] = useState<boolean>(false); // Estado do popup de votação
  const [queue, setQueue] = useState<Music[]>([]); // Fila de músicas
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

  const playbackActions = usePlayback(); // Ações de reprodução
  const voteActions = useVote(); // Ações de votação
  const interval = useRef<number | null>(null); // Ref para o intervalo de atualização

  // UseEffect para buscar dados relacionados à música atual, votação e fila de reprodução
  useEffect(() => {
    // Função para buscar dados da música atual
    const fetchData = async () => {
      // Verifica se o ID da pista e a música atual existem
      if (trackId && playingNow) {
        // Limpa os votos quando a URI da música atual mudar
        setVotes(undefined);
        setDJPlayingNow(null);

        // Busca os dados da música atual
        try {
          const [fetchedVerifyIfDJHasAlreadVoted, fetchedVotes, fetchedDJPlayingNow] = await Promise.all([
            voteActions.verifyIfDJHasAlreadVoted(djToken), // Verifica se o DJ já votou
            voteActions.getAllVotesForThisMusic(trackId, playingNow.item?.uri ?? 'dispositivo não conectado'), // Busca todos os votos para a música atual
            playbackActions.getDJAddedCurrentMusic(trackId) // Busca o DJ que adicionou a música atual
          ]);

          setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted ?? false); // Define se o popup de votação deve ser exibido com base na verificação se o DJ já votou
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
          const fetchedPlayingNow = await playbackActions.getState(trackId) // Busca o estado do player

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

  // UseEffect para lidar com eventos do socket
  useEffect(() => {
    // Verifica se o socket está conectado e se o DJ existe
    if (socket.connected) {
      socket.emit('joinRoom', `track_${trackId}`); // Entra na sala da pista
    }

    // Socket que recebe a informação de que um novo voto foi adicionado
    const handleNewVote = (data: { vote: voteValues }) => {
      setVotes((prevVotes) => {
        // Verifica se os votos anteriores existem
        if (!prevVotes || !prevVotes.voteValues) {
          return { voteValues: [data.vote] }; // Retorna os novos votos
        }
        return { voteValues: [...prevVotes.voteValues, data.vote] }; // Retorna os votos anteriores com o novo voto
      });
    };

    // Socket que recebe a informação de que a fila foi atualizada
    const handleQueueUpdated = (data: { queue: TQueue[], spotifyQueue: Music[]}) => {
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
    votes,
    djPlayingNow,
    showVotePopup,
    setShowVotePopup,
    queue,
    isLoading,
  };
};

export default useFetchPlaybackData;