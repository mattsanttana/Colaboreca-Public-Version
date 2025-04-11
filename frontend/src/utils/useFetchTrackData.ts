import { useEffect, useState } from 'react';
import useDJ from './useDJ';
import useTrack from './useTrack';
import { DJ } from '../types/DJ';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // Conecta ao servidor WebSocket

const useFetchTrackData = (trackId: string | undefined, token: string) => {
  const [trackName, setTrackName] = useState(''); // Nome da pista
  const [dj, setDJ] = useState<DJ>(); // DJ atual
  const [djs, setDJs] = useState<DJ[]>([]); // Lista de DJs
  const [showPopup, setShowPopup] = useState(false); // Estado do popup
  const [popupMessage, setPopupMessage] = useState(''); // Mensagem do popup
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined); // URL para redirecionar
  const [previewRank, setPreviewRank] = useState<DJ[]>([]); // Ranking anterior
  const [showRankingChangePopup, setShowRankingChangePopup] = useState(false); // Estado do popup de mudança de ranking

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
              trackActions.getTrackById(trackId), // Busca os dados da pista
              djActions.getDJData(token) // Busca os dados do DJ
            ]);
  
            // Verifica se o DJ está na pista e caso não esteja, exibe um popup de erro
            if (!fetchedDJData?.data.dj) {
              setPopupMessage('Você não é um DJ desta pista, por favor faça login'); // Mensagem de erro
              setRedirectTo('/enter-track'); // Redireciona para a página de login
              setShowPopup(true); // Exibe o popup
            }
  
            // Verifica se a pista existe
            if (fetchedTrack?.status === 200) {
              setTrackName(fetchedTrack?.data.trackName); // Define o nome da pista
              setDJs(fetchedDJData?.data.djs); // Define a lista de DJs
              setDJ(fetchedDJData?.data.dj); // Define o DJ atual
            } else {
              // Caso a pista não exista, exibe um popup de erro
              setPopupMessage('Esta pista não existe'); // Mensagem de erro
              setRedirectTo('/enter-track'); // Redireciona para a página de login
              setShowPopup(true); // Exibe o popup
            }
          } catch (error) {
            console.error('Error fetching data:', error); // Em caso de erro exibe no console
          }
        }
      };
  
      fetchData(); // Chama a função para buscar os dados iniciais
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // UseEffect para lidar com eventos do socket
    useEffect(() => {
      // Verifica se o socket está conectado e se o DJ existe
      if (socket.connected && dj) {
        socket.emit('joinRoom', `track_${trackId}`); // Entra na sala da pista
      }

      // Socket que recebe as atualizações feitas no nome da pista
      const handleTrackUpdated = (updatedTrack: { trackName: string }) => { 
        setTrackName(updatedTrack.trackName); // Atualiza o nome da pista
      }

      // Socket que recebe a informação de que a pista foi deletada
      const handleTrackDeleted = (data: { trackId: number }) => {
        // Verifica se o ID da pista recebida é igual ao ID da pista atual
        if (Number(trackId) === Number(data.trackId)) {
          setPopupMessage('Esta pista foi deletada'); // Mensagem de que a pista foi deletada
          setRedirectTo('/enter-track'); // Redireciona para a página de login
          setShowPopup(true); // Exibe o popup
        }
      };

      // Socket que recebe a informação de que um novo DJ foi criado
      const handleDJCreated = (data: { dj: DJ }) => {
        setDJs((prevDJs) => [...prevDJs, data.dj]); // Adiciona o novo DJ à lista de DJs
      };

      // Socket que recebe a informação de que um DJ foi atualizado
      const handleDJUpdated = (updatedDJ: DJ) => {
        // Atualiza a lista de DJs
        setDJs((prevDJs) =>
          prevDJs.map((dj) => {
            // Verifica se o ID do DJ atual é igual ao ID do DJ atualizado
            if (Number(dj.id) === Number(updatedDJ.id)) {
              return updatedDJ; // Atualiza o DJ na lista
            }
            return dj; // Caso contrário mantém o DJ atual
          })
        );

        // Atualiza o DJ atual (se aplicável)
        setDJ((currentDJ) => {
          // Verifica se o ID do DJ atual é igual ao ID do DJ atualizado
          if (currentDJ?.id === updatedDJ.id) {
            const updatedDJRanking = updatedDJ.ranking === 0 ? Infinity : updatedDJ.ranking; // Define o ranking atualizado tratando o 0 como infinito( não ranquado )
            const currentDJRanking = currentDJ.ranking === 0 ? Infinity : currentDJ.ranking; // Define o ranking atual tratando o 0 como infinito ( não ranquado )
            // Verifica se o ranking atualizado é menor que o ranking atual
            if (updatedDJRanking < currentDJRanking) {
              setPreviewRank(djs); // Atualiza o estado previewRank
              setShowRankingChangePopup(true); // Exibe o popup de mudança de ranque
            }
            return updatedDJ; // Atualiza o DJ atual
          }
          return currentDJ; // Mantém o DJ atual
        });
      };

      // Socket que recebe a informação de que um DJ foi deletado
      const handleDJDeleted = (data: { id: number}) => {
        // Verifica se o ID do DJ deletado é igual ao ID do DJ atual
        if (Number(dj?.id) === Number(data.id)) {
          setPopupMessage('Você foi removido desta pista'); // Mensagem de que o DJ foi removido
          setRedirectTo('/enter-track'); // Redireciona para a página de login
          setShowPopup(true); // Exibe o popup
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
    trackName, // Nome da pista
    setTrackName, // Função para definir o nome da pista
    dj, // DJ atual
    djs, // Lista de DJs
    showPopup, // Estado do popup
    setShowPopup, // Função para definir o estado do popup
    popupMessage, // Mensagem do popup
    setPopupMessage, // Função para definir a mensagem do popup
    redirectTo, // URL para redirecionar
    setRedirectTo, // Função para definir a URL para redirecionar
    trackActions, // Ações da pista
    djActions, // Ações do DJ
    showRankingChangePopup, // Estado do popup de mudança de ranking
    setShowRankingChangePopup, // Função para definir o estado do popup de mudança de ranking
    previewRank, // Ranking anterior
    
   };
}

export default useFetchTrackData;