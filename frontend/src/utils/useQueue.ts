import { useEffect, useRef, useState } from 'react';
import usePlayback from './usePlayback';
import TQueue from '../types/TQueue';
import PlayingNow from '../types/PlayingNow';
import { useParams } from 'react-router-dom';

const useQueue = (playingNow: PlayingNow | null, currentTrackIndex?: number) => {
  const { trackId, } = useParams(); // Pega o ID da pista da URL
  const [ queue, setQueue ] = useState<TQueue[]>([]); // Estado para armazenar a fila de músicas
  const [ isLoadingQueue, setIsLoadingQueue ] = useState<boolean>(true); // Estado para indicar se está carregando

  const playbackActions = usePlayback(); // Ações de reprodução, como pular músicas
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]); // Referências para os itens da fila

  // useEfect para buscar a fila de músicas quando o componente é montado
  useEffect(() => {
    const fetchQueueData = async () => {
      if (trackId) {
        const queue = await playbackActions.getQueue(Number(trackId)); // Busca a fila de músicas usando a ação de reprodução

        setQueue(queue); // Atualiza o estado da fila com os dados recebidos
        setIsLoadingQueue(false); // Define o estado de carregamento como falso
      }
    }

    fetchQueueData(); // Chama a função para buscar os dados da fila

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingNow?.item?.uri || '']);

  // useEffect para atualizar o índice da música no carrossel
  useEffect(() => {
    // Rolar para o item selecionado sempre que currentTrackIndex mudar
    if (currentTrackIndex !== undefined && trackRefs.current[currentTrackIndex]) {
      trackRefs.current[currentTrackIndex].scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [currentTrackIndex]);

  return {
    queue,
    trackRefs,
    isLoadingQueue
  }
}

export default useQueue;