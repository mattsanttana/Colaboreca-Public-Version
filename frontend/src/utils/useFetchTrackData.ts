import { useEffect, useState } from 'react';
import useDJ from './useDJ';
import useTrack from './useTrack';
import { DJ } from '../types/DJ';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:3001'); // Conecta ao servidor WebSocket

const useFetchTrackData = (djToken: string) => {
  const { trackId, } = useParams(); // Pega o ID da pista da URL
  const [trackName, setTrackName] = useState(''); // Nome da pista
  const [dj, setDJ] = useState<DJ>(); // DJ atual
  const [djs, setDJs] = useState<DJ[]>([]); // Lista de DJs
  const [globalPreviousRanking, setGlobalPreviousRanking] = useState<DJ[]>([]); // Para animações
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false }); // Mensagem do popup
  const [previousRanking, setPreviousRanking] = useState<DJ[]>([]); // Ranking anterior
  const [showRankingChangePopup, setShowRankingChangePopup] = useState(false); // Estado do popup de mudança de ranking
  const [showTrackInfoPopup, setShowTrackInfoPopup] = useState(false); // Estado para controlar o popup de informações da pista

  const djActions = useDJ(); // Ações do DJ
  const trackActions = useTrack(); // Ações da pista

  // UseEffect para buscar dados iniciais
  useEffect(() => {
    // Função para buscar dados iniciais
    const fetchData = async () => {
      // Verifica se o ID da pista existe
      if (trackId) {
        // Busca os dados da pista e do DJ
        try {
          const [fetchedTrack, fetchedDJData] = await Promise.all([
            trackActions.getTrackById(Number(trackId)), // Busca os dados da pista
            djActions.getDJData(djToken) // Busca os dados do DJ
          ]);

          // Verifica se o DJ está na pista e caso não esteja, exibe um popup de erro
          if (!fetchedDJData?.data.dj) {
            setPopupMessageData({
              message: 'Você não está nesta pista',
              redirectTo: '/enter-track',
              show: true
            });
          }

          // Verifica se a pista existe
          if (fetchedTrack?.status === 200) {
            setTrackName(fetchedTrack?.data.trackName); // Define o nome da pista
            setDJs(fetchedDJData?.data.djs); // Define a lista de DJs
            setDJ(fetchedDJData?.data.dj); // Define o DJ atual
          } else {
            // Caso a pista não exista, exibe um popup de erro
            setPopupMessageData({
              message: 'Esta pista não existe',
              redirectTo: '/enter-track',
              show: true
            });
          }
        } catch (error) {
          console.error('Error fetching data:', error); // Em caso de erro exibe no console
        }
      }
    }

    fetchData(); // Chama a função para buscar os dados iniciais

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // UseEffect para lidar com eventos do socket
    useEffect(() => {
      // Verifica se o socket está conectado e se o DJ existe
      if (socket.connected && dj) {
        socket.emit('joinRoom', `track_${ trackId }`); // Entra na sala da pista
      }

      // Socket que recebe as atualizações feitas no nome da pista
      const handleTrackUpdated = (updatedTrack: { trackName: string }) => { 
        setTrackName(updatedTrack.trackName); // Atualiza o nome da pista
      }

      // Socket que recebe a informação de que a pista foi deletada
      const handleTrackDeleted = (data: { trackId: number }) => {
        // Verifica se o ID da pista recebida é igual ao ID da pista atual
        if (Number(trackId) === Number(data.trackId)) {
          setPopupMessageData({
            message: 'Esta pista foi deletada',
            redirectTo: '/enter-track',
            show: true
          }); // Exibe o popup de erro
        }
      };

      // Socket que recebe a informação de que um novo DJ foi criado
      const handleDJCreated = (data: { dj: DJ }) => {
        setDJs((prevDJs) => [...prevDJs, data.dj]); // Adiciona o novo DJ à lista de DJs
      };

      // Socket que recebe a informação de que um DJ foi atualizado
      const handleDJUpdated = (updatedDJ: DJ) => {
        // 1. Captura global do estado anterior para animações gerais
        const previousState = [...djs];
        setGlobalPreviousRanking(previousState);
        
        // 2. Atualiza a lista de DJs
        setDJs(prevDJs => 
          prevDJs.map(dj => 
            Number(dj.id) === Number(updatedDJ.id) ? updatedDJ : dj
          )
        );

        // 3. Verificação específica para popup (DJ atual subindo)
        setDJ((currentDJ) => {
          if (currentDJ?.id === updatedDJ.id) {
            const updatedRank = updatedDJ.ranking === 0 ? Infinity : updatedDJ.ranking;
            const currentRank = currentDJ.ranking === 0 ? Infinity : currentDJ.ranking;
            
            if (updatedRank < currentRank) {
              // 4. Captura estado anterior específico para o popup
              setPreviousRanking(previousState);
              setShowRankingChangePopup(true);
            }
            return updatedDJ;
          }
          return currentDJ;
        });
      };

      // Socket que recebe a informação de que um DJ foi deletado
      const handleDJDeleted = (data: { id: number}) => {
        // Verifica se o ID do DJ deletado é igual ao ID do DJ atual
        if (Number(dj?.id) === Number(data.id)) {
          setPopupMessageData({
            message: 'Você foi deletado desta pista',
            redirectTo: '/enter-track',
            show: true
          }); // Exibe o popup de erro
        } else {
          setDJs((prevDJs) => prevDJs.filter((dj) => Number(dj.id) !== Number(data.id))); // Atualiza a lista de DJs removendo o DJ deletado
        }
      };

      // Eventos do socket e funções de callback
      socket.on('track updated', handleTrackUpdated);
      socket.on('track deleted', handleTrackDeleted);
      socket.on('dj created', handleDJCreated);
      socket.on('dj updated', handleDJUpdated);
      socket.on('dj deleted', handleDJDeleted);

      // Limpa os eventos do socket quando o componente é desmontado
      return () => {
        socket.off('track updated', handleTrackUpdated);
        socket.off('track deleted', handleTrackDeleted);
        socket.off('dj created', handleDJCreated);
        socket.off('dj updated', handleDJUpdated);
        socket.off('dj deleted', handleDJDeleted);
      };

    // Adiciona dependência para o DJ atual para que caso quando o componente seja montado e o dj ainda não tenha sido definido o UseEffect seja executado
    // de novo quando o DJ for definido
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dj]);

  return {
    dj, // DJ atual
    djs, // Lista de DJs
    globalPreviousRanking,
    popupMessageData, // Dados do popup de mensagem
    previousRanking, // Ranking anterior
    setPopupMessageData, // Função para definir os dados do popup de mensagem
    setShowRankingChangePopup, // Função para definir o estado do popup de mudança de ranking
    setShowTrackInfoPopup, // Função para definir o estado do popup de informações da pista
    setTrackName, // Função para definir o nome da pista
    showRankingChangePopup, // Estado do popup de mudança de ranking
    showTrackInfoPopup, // Estado do popup de informações da pista
    trackId,
    trackName, // Nome da pista
   };
}

export default useFetchTrackData;