import { useState, useEffect, useMemo } from 'react';
import usePlayback from './usePlayback';
import { Music } from '../types/SpotifySearchResponse';
import PopupMessageData from '../types/PopupMessageData';
import { useParams } from 'react-router-dom';

const useAddMusicToQueue = (
  search: string, djToken: string, setPopupMessageData: (data: PopupMessageData) => void
) => {
  const { trackId, } = useParams(); // Pega o ID da pista da URL
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  // const [isLoadingTopTracks, setIsLoadingTopTracks] = useState(true);
  const [searchResults, setSearchResults] = useState<Music[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [topTracksInBrazil, setTopTracksInBrazil] = useState<Music[]>([]);

  const playbackActions = usePlayback();

  // Carrega as músicas populares no Brasil apenas uma vez
  useEffect(() => {
    const fetchTopTracksInBrazil = async () => {
      setIsDebouncing(true); // Inicia o loading
      try {
        const response = await playbackActions.getTopMusicsInBrazil(Number(trackId));
        if (response?.status === 200) {
          setTopTracksInBrazil(response.data);
          // setIsDebouncing(false); // Finaliza o loading
        } else {
          console.error('Error fetching top tracks in Brazil');
        }
      } catch (error) {
        console.error('Error fetching top tracks in Brazil:', error);
      } finally {
        setIsDebouncing(false); // Finaliza o loading
      }
    };

    fetchTopTracksInBrazil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  // Atualiza debouncedSearch após um delay (debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 600);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Busca resultados de pesquisa quando debouncedSearch muda
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.trim() === '') {
      setSearchResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      setIsDebouncing(true);
      try {
        const response = await playbackActions.getTrackBySearch(Number(trackId), debouncedSearch);
        if (response?.status === 200) {
          setSearchResults(response.data);
        } else {
          setPopupMessageData({
            message: 'Erro ao buscar músicas, por favor tente novamente.',
            redirectTo: '',
            show: true
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsDebouncing(false);
      }
    };

    fetchSearchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, trackId]);

  const handleClick = (music: Music) => {
    setSelectedMusic(music);
    setShowModal(true);
  }

  const handleConfirmAddTrack = async () => {
    if (selectedMusic) {
      setIsAddingTrack(true);
      try {
        const addMusic = await playbackActions.addTrackToQueue(
          Number(trackId),
          selectedMusic.album.images[0].url,
          selectedMusic.name,
          selectedMusic.artists.map((artist) => artist.name).join(', '),
          selectedMusic.uri,
          djToken
        );

        if (addMusic?.status === 200) {
          handleCloseModal();
          return;
        }

        if (addMusic?.status === 401) {
          setPopupMessageData({
            message: 'Você já tem 3 músicas na fila, por favor, aguarde até que uma seja tocada.',
            redirectTo: '',
            show: true
          });
        }
        if (addMusic?.status === 409) {
          setPopupMessageData({
            message: 'Essa música já está na fila, por favor escolha outra.',
            redirectTo: '',
            show: true
          });
        } 
      } catch (error) {
        console.error(error);
      } finally {
        setIsAddingTrack(false);
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMusic(null);
  }

  const memoizedSearchResults = useMemo(() => searchResults, [searchResults]);
  const memoizedTopTracksInBrazil = useMemo(() => topTracksInBrazil, [topTracksInBrazil]);

  return {
    handleClick,
    handleCloseModal,
    handleConfirmAddTrack,
    isAddingTrack,
    // isLoadingTopTracks,
    isDebouncing,
    memoizedSearchResults,
    memoizedTopTracksInBrazil,
    selectedMusic,
    showModal
  };
};

export default useAddMusicToQueue;