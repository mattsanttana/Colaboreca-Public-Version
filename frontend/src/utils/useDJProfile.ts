import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePlayback from './usePlayback';
import useDJ from './useDJ';
import PopupMessageData from '../types/PopupMessageData';
import { DJMusic } from '../types/SpotifySearchResponse';
import { DJ } from '../types/DJ';

const useDJProfile = (djToken: string, isTrackOwner: boolean, setPopupMessageData: (data: PopupMessageData) => void) => {
  const { djId, trackId, } = useParams(); // Pega o ID da pista e do DJ da URL
  const [addedMusics, setAddedMusics] = useState<DJMusic[]>([]); // Estado para armazenar as músicas adicionadas pelo DJ
  const [djProfile, setDJProfile] = useState<DJ>(); // Estado para armazenar o perfil do DJ
  const [editedCharacterPath, setEditedCharacterPath] = useState(''); // Caminho do novo personagem do DJ
  const [isProfileOwner, setIsProfileOwner] = useState(false); // Estado para controlar se o usuário é o dono do perfil
  const [showCharacterPopup, setShowCharacterPopup] = useState(false); // Estado para exibir o popup de seleção de avatar
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // Estado para confirmação de exclusão do DJ
  const [showDJInfoPopup, setShowDJInfoPopup] = useState(false); // Estado para controlar o popup de informações do DJ

  const djActions = useDJ(); // Hook personalizado para ações do DJ
  const playbackActions = usePlayback(); // Hook personalizado para ações de reprodução
  
  // Useffect para buscar os dados do DJ e das músicas adicionadas
    useEffect(() => {
      const fetchData = async () => {
        // Verifica se o trackId foi definido
        if (trackId) {
          // Caso tenha sido definido, busca o perfil do DJ e verifica se o usuário é o dono do perfil
          const [fetchedDJProfile, fetchedMusics, fetchedVerifyIfDJIsOwner] = await Promise.all([
            djActions.getDJById(djId, Number(trackId)), // Busca o perfil do DJ
            playbackActions.getAddedMusicsByDJ(Number(djId), Number(trackId)), // Busca as músicas adicionadas pelo DJ
            djActions.verifyIfTheDJIsTheProfileOwner(Number(djId), djToken) // Verifica se o usuário é o dono do perfil
          ])
  
          // Verifica se a busca do perfil do DJ foi bem-sucedida
          if(fetchedDJProfile?.status !== 200) {
            // Se não foi, define uma mensagem de erro no popup
            setPopupMessageData({
              message: 'Algo deu errado ao buscar o DJ, por favor tente novamente mais tarde.', // Mensagem de erro
              show: true, // Exibe o popup
              redirectTo: isTrackOwner ? `/track-info/${ trackId }` : `/track/${ trackId }` // Redireciona para a página inicial da pista
            })
            // Caso contrário
          } else {
            setAddedMusics(fetchedMusics); // Define as músicas adicionadas pelo DJ
            setDJProfile(fetchedDJProfile.data); // Define o perfil do DJ
            setIsProfileOwner(fetchedVerifyIfDJIsOwner ?? false); // Define se o usuário é o dono do perfil
          }
        }
      }
  
      fetchData();
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
      addedMusics,
      djProfile,
      editedCharacterPath,
      isProfileOwner,
      setShowDJInfoPopup,
      setEditedCharacterPath,
      setShowCharacterPopup,
      setShowDeleteConfirmation,
      showCharacterPopup,
      showDeleteConfirmation,
      showDJInfoPopup
    }
};

export default useDJProfile;