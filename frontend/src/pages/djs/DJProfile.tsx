import '../../styles/djs/DJProfile.css';
import { lazy, Suspense } from 'react';
import { Card, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import DJProfileMini from './DJProfileMini';
import Header from '../shared/Header';
import Menu from '../shared/Menu';
import { logo } from '../../assets/images/characterPath'
import { RootState } from '../../redux/store';
import useFetchPlaybackData from '../../utils/useFetchPlaybackData';
import useFetchTrackData from '../../utils/useFetchTrackData';
import useMenu from '../../utils/useMenu';
import AddedMusicsByDJ from './AddedMusicsByDJ';
import CharactersSelectPopup from './CharactersSelectPopup';
import DeleteConfirmationPopup from './DeleteDJConfirmationPopup';
import EditOrDeleteDJPopup from './EditOrDeleteDJPopup';
import useDJProfile from '../../utils/useDJProfile';
import DJVoteRadar from './DJVoteRadar';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy (() => import('../shared/MessagePopup'));
const RankingChangePopup = lazy(() => import('../ranking/RankingChangePopup'));
const VotePopup = lazy(() => import('./VotePopup'));

// Props recebidas pelo redux
interface Props {
  token: string; // Token do DJ
}

// Componente principal da página de perfil do DJ
const DJProfile: React.FC<Props> = ({ token }) => {
  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, globalPreviousRanking, ownerDJId, popupMessageData, previousRanking, setPopupMessageData, setShowRankingChangePopup,
    queueSettings, refreshTrackSettings, setQueueSettings, setTrackName, showRankingChangePopup, trackName, trackId
  } = useFetchTrackData(token);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData(token)

  const { 
    addedMusics, djProfile, editedCharacterPath, isProfileOwner, setShowDJInfoPopup, setEditedCharacterPath, setShowCharacterPopup,
    setShowDeleteConfirmation, showCharacterPopup, showDeleteConfirmation, showDJInfoPopup
  } = useDJProfile(token, setPopupMessageData)
  
  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu() // Hook personalizado para lidar com o menu

  // Renderiza o componente DJProfile
  return (
    <Container
      className='dj-profile-screen'
      onTouchStart={ handleTouchStart } // Adiciona o evento de toque inicial
      onTouchMove={ handleTouchMove } // Adiciona o evento de movimento do toque
      onTouchEnd={ handleTouchEnd } // Adiciona o evento de toque final
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
        { /* Componente de popup para altear o avatar */ }
        <CharactersSelectPopup
          onHide={ () => setShowCharacterPopup(false) } // Função para fechar o popup
          setCharacterPath={ setEditedCharacterPath } // Função de armazenar o novo personagem
          setShowCharacterPopup={ setShowCharacterPopup } // Função de estado do popup de seleção de personagem
          show={ showCharacterPopup } // Estado para exibir o popup
        />
        { /* Componente de popup de confirmação de exclusão */ }
        <DeleteConfirmationPopup
          dj={ dj } // DJ logado
          ownerDjId={ ownerDJId }
          token={ token } // Token do DJ logado
          onHide={ () => setShowDeleteConfirmation(false) } // Função para fechar o popup
          setPopupMessageData={ setPopupMessageData } // Função para definir os dados do popup de mensagem
          show={ showDeleteConfirmation } // Estado para exibir o popup de confirmação
        />
        { /* Componente de popup para editar ou excluir o DJ */ }
        <EditOrDeleteDJPopup
          dj={ dj } // DJ logado
          token={ token } // Token do DJ logado
          editedCharacterPath={ editedCharacterPath } // Caminho do personagem editado
          setShow={ setShowDJInfoPopup } // Estado para mostrar o popup
          setEditedCharacterPath={ setEditedCharacterPath } // Função para definiri o personagem escolhido
          setPopupMessageData={ setPopupMessageData } // Função pra definir os dados do popup de mensagem
          setShowCharacterPopup={ setShowCharacterPopup } // Função para exibir o popup de seleção de avatar
          setShowDeleteConfirmation={ setShowDeleteConfirmation } // Função para exibir o popup de confirmação de exclusão
          show={ showDJInfoPopup } // Estado para exibir o popup de edição ou exclusão
        />
        {/* Componentes de popups de mensagem */}
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          onHide={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
        { /* Popup de alteração de ranking */ }
        <RankingChangePopup
          show={ showRankingChangePopup } // Envia o estado do popup como prop
          dj={ dj } // Envia o DJ atual como prop
          ownerDJId={ ownerDJId }
          previousRanking={ previousRanking } // Envia o ranking anterior como prop
          currentRanking={ djs } // Envia o ranking atual como prop
          onHide={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
          trackName={ trackName } // Nome da pista
        />
        { /* popup de votação */ }
        <VotePopup
          djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
          onHide={ () => setShowVotePopup(false) }  // Função para fechar o popup
          playingNow={ playingNow } // Envia o estado de reprodução como prop
          show={ showVotePopup } // Envia o estado do popup como prop
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        <Container
          className='d-flex justify-content-center align-items-center djprofile-container' // Centraliza o conteúdo
 // Define a altura da tela inteira
        >
          { /* Se sim, exibe a logo de carregamento */ }
          <Image
            alt='Logo de Carregamento' // Texto alternativo para a imagem
            className='logo-spinner' // Classe para estilização da imagem
            src={ logo } // Caminho da imagem da logo
          />
        </Container>
        // Se não estiver carregando, renderiza o conteúdo principal
      ) : (
        <Container className='gradient-border dj-profile-page'>
          { /* Renderiza o cabeçalho com as informações do DJ e o estado do menu */ }
          <Header
            currentRanking={ djs } // Envia o ranking atual como prop
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
            setTrackName={ setTrackName }
            queueSettings={ queueSettings }
            onSettingsChange={ setQueueSettings }
            refreshTrackSettings={ refreshTrackSettings }
            showVotePopup={ showVotePopup } // Envia o estado do popup de votação
            token={ token } // Envia o token do DJ como prop
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista como prop
            trackName={ trackName } // Envia o nome da pista como prop
          />
          <Row className='dj-profile-content-row'>
            { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Col
              className='d-none d-xxl-block' // Esconde a coluna em telas menores que xxl
              md={ 3 } // Define a largura da coluna em telas médias
            >
              { /* Componente de menu */ }
              <Menu
                currentRanking={ djs } // Envia o ranking atual como prop
                dj={ dj } // Envia o DJ atual como prop
                previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
                trackId={ Number(trackId) } // Envia o ID da pista como prop
              />
            </Col>
            { /* Renderiza a coluna principal com as informações do DJ */ }
            <Col 
              className='py-4 dj-profile-main-column' // Adiciona padding vertical
              // Largura para diferentes tamanhos de tela
              md={ 12 }  lg={ 12 }  xl={ 12 } xxl={ 9 }
            >
              <Card
                className='text-center gradient-border dj-profile-card' // Estilo de texto centralizado
              >
                <div className='dj-profile-overview'>
                  <DJProfileMini
                    currentRanking={ djs }
                    dj={ djProfile } // Envia o perfil do DJ como prop
                    onEdit={ () => setShowDJInfoPopup(true) }
                    previousRanking={ globalPreviousRanking }
                    showEditButton={ isProfileOwner }
                  />
                  <DJVoteRadar addedMusics={ addedMusics } />
                </div>
                  { /*Renderiza o componente de músicas adicionadas pelo DJ */ }
                  <div className='dj-added-musics-slot'>
                    <AddedMusicsByDJ addedMusics={ addedMusics } />
                  </div>
                </Card>
              </Col>
            </Row>
          </Container>
        )}
      </Container>
    );
  }

const mapStateToProps = (state: RootState) => ({
  token: state.reducer.token
});

const DJProfileConnected = connect(mapStateToProps)(DJProfile);

export default DJProfileConnected;
