import { lazy, Suspense } from 'react';
import { Button, Card, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import DJProfileMini from './DJProfileMini';
import Header from './Header';
import Menu from './Menu';
import { logo } from '../assets/images/characterPath'
import { RootState } from '../redux/store';
import useFetchPlaybackData from '../utils/useFetchPlaybackData';
import useFetchTrackData from '../utils/useFetchTrackData';
import useMenu from '../utils/useMenu';
import AddedMusicsByDJ from './AddedMusicsByDJ';
import CharactersSelectPopup from './CharactersSelectPopup';
import DeleteConfirmationPopup from './DeleteDJConfirmationPopup';
import EditOrDeleteDJPopup from './EditOrDeleteDJPopup';
import useDJProfile from '../utils/useDJProfile';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy (() => import('./MessagePopup'));
const RankingChangePopup = lazy (() => import('./RankingChangePopup'));
const TrackInfoPopup = lazy(() => import('./TrackInfoPopup'));
const VotePopup = lazy(() => import('./VotePopup'));

// Props recebidas pelo redux
interface Props {
  djToken: string; // Token do DJ
  trackToken: string; // Token da pista
}

// Componente principal da página de perfil do DJ
const DJProfile: React.FC<Props> = ({ djToken, trackToken }) => {
  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup,
    showTrackInfoPopup, setTrackName, showRankingChangePopup, trackName, setShowTrackInfoPopup, trackId
  } = useFetchTrackData(djToken, trackToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData(djToken)

  const { 
    addedMusics, djProfile, editedCharacterPath, isProfileOwner, setShowDJInfoPopup, setEditedCharacterPath, setShowCharacterPopup,
    setShowDeleteConfirmation, showCharacterPopup, showDeleteConfirmation, showDJInfoPopup
  } = useDJProfile(djToken, isTrackOwner, setPopupMessageData)
  
  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu() // Hook personalizado para lidar com o menu

  // Renderiza o componente DJProfile
  return (
    <Container
      onTouchStart={ handleTouchStart } // Adiciona o evento de toque inicial
      onTouchMove={ handleTouchMove } // Adiciona o evento de movimento do toque
      onTouchEnd={ handleTouchEnd } // Adiciona o evento de toque final
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
        { /* Componente de popup para altear o avatar */ }
        <CharactersSelectPopup
          onHide={ () => setShowCharacterPopup(false) } // Função para fechar o popup
          setEditedCharacterPath={ setEditedCharacterPath } // Função de armazenar o novo personagem
          setShowCharacterPopup={ setShowCharacterPopup } // Função de estado do popup de seleção de personagem
          show={ showCharacterPopup } // Estado para exibir o popup
        />
        { /* Componente de popup de confirmação de exclusão */ }
        <DeleteConfirmationPopup
          dj={ dj } // DJ logado
          djToken={ djToken } // Token do DJ logado
          onHide={ () => setShowDeleteConfirmation(false) } // Função para fechar o popup
          setPopupMessageData={ setPopupMessageData } // Função para definir os dados do popup de mensagem
          show={ showDeleteConfirmation } // Estado para exibir o popup de confirmação
        />
        { /* Componente de popup para editar ou excluir o DJ */ }
        <EditOrDeleteDJPopup
          dj={ dj } // DJ logado
          djToken={ djToken } // Token do DJ logado
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
          handleClose={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
        { /* Popup de alteração de ranking */ }
        <RankingChangePopup
          showRankingChangePopup={ showRankingChangePopup } // Envia o estado do popup como prop
          dj={ dj } // Envia o DJ atual como prop
          previousRanking={ previewRanking } // Envia o ranking anterior como prop
          currentRanking={ djs } // Envia o ranking atual como prop
          handleClose={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
        />
        { /* Popup de informações da pista */ }
        <TrackInfoPopup
          trackToken={ trackToken } // Token da pista
          trackName={ trackName } // Nome da pista
          setTrackName={ setTrackName } // Função para definir o nome da pista
          show={ showTrackInfoPopup } // Estado do popup de informações da pista
          setShow={ setShowTrackInfoPopup } // Função para definir o estado do popup
        />
        { /* popup de votação */ }
        <VotePopup
          djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
          handleClose={ () => setShowVotePopup(false) }  // Função para fechar o popup
          playingNow={ playingNow } // Envia o estado de reprodução como prop
          showVotePopup={ showVotePopup } // Envia o estado do popup como prop
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        <Container
          className='d-flex justify-content-center align-items-center' // Centraliza o conteúdo
          style={{ height: '100vh' }} // Define a altura da tela inteira
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
        <Container>
          { /* Renderiza o cabeçalho com as informações do DJ e o estado do menu */ }
          <Header
              dj={ dj } // Envia o DJ atual como prop
              isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop
              isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
              setShowTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
              showVotePopup={ showVotePopup } // Envia o estado do popup de votação
              toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
              trackId={ trackId } // Envia o ID da pista como prop
            />
          <Row>
            { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Col
              className='d-none d-xxl-block' // Esconde a coluna em telas menores que xxl
              md={ 3 } // Define a largura da coluna em telas médias
            >
              { /* Componente de menu */ }
              <Menu
                dj={ dj } // Envia o DJ atual como prop
                isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
                trackId={ Number(trackId) } // Envia o ID da pista como prop
              />
            </Col>
            { /* Renderiza a coluna principal com as informações do DJ */ }
            <Col 
              className='py-4' // Adiciona padding vertical
              // Largura para diferentes tamanhos de tela
              md={ 12 }  lg={ 12 }  xl={ 12 } xxl={ 9 }
            >
              <Card
                className='text-center' // Estilo de texto centralizado
                style={{ backgroundColor: 'transparent', padding: '0' }} // Cor e preenchimento do card
              >
                { /* Renderiza o mini perfil do DJ */ }
                <DJProfileMini
                  dj={ djProfile } // Envia o perfil do DJ como prop
                />
                  { /* Caso o usuário seja o dono do perfil e não seja o dono da pista, exibe o botão para editar/excluir DJ */ }
                  { isProfileOwner && !isTrackOwner && (
                    <Container className='d-flex justify-content-center align-items-center mt-4'>
                      <Button 
                        onClick={ () => setShowDJInfoPopup(true) } // Função para abrir o popup de informações do DJ
                        variant='primary'  // Estilo do botão
                      >
                        Editar/Excluir DJ
                      </Button>
                    </Container>
                  )}
                  { /*Renderiza o componente de músicas adicionadas pelo DJ */ }
                  <AddedMusicsByDJ addedMusics={ addedMusics } />
                </Card>
              </Col>
            </Row>
          </Container>
        )}
      </Container>
    );
  }

const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token,
  trackToken: state.trackReducer.token
});

const DJProfileConnected = connect(mapStateToProps)(DJProfile);

export default DJProfileConnected;
