import '../../styles/queue/AddMusicToQueue.css';
import { lazy, Suspense, useState } from 'react';
import { Card, Col, Container, Form, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import Header from '../shared/Header';
import Menu from '../shared/Menu';
import { logo } from '../../assets/images/characterPath';
import { RootState } from '../../redux/store';
// import { Music } from '../../types/SpotifySearchResponse';
import useMenu from '../../utils/useMenu';
import useFetchTrackData from '../../utils/useFetchTrackData';
import useFetchPlaybackData from '../../utils/useFetchPlaybackData';
import useAddMusicToQueue from '../../utils/useAddMusicToQueue';
import TrackGrid from './AddTrackGrid';

// Componentes que não precisam ser carregados inicialmente
const AddMusicConfirmationModal = lazy(() => import('./AddMusicConfirmationPopup'));
const MessagePopup = lazy(() => import('../shared/MessagePopup'));
const RankingChangePopup = lazy(() => import('../ranking/RankingChangePopup'));
const VotePopup = lazy(() => import('../djs/VotePopup'));

// Props recebidas pelo redux
interface Props {
  token: string; // Token do DJ
}

// Componente principal da página de adicionar música à fila
const AddMusicToQueue: React.FC<Props> = ({ token }) => {
  const [search, setSearch] = useState(''); // Estado para armazenar o texto de pesquisa

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, globalPreviousRanking, ownerDJId, popupMessageData, previousRanking, setPopupMessageData, setShowRankingChangePopup,
    queueSettings, refreshTrackSettings, setQueueSettings, setTrackName, showRankingChangePopup, trackId, trackName
  } = useFetchTrackData(token);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData();

  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu(); // Hook personalizado para lidar com o menu

  // Função para lidar com a mudança no campo de pesquisa
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value); // Atualiza o estado de pesquisa com o valor do campo de entrada
  }

  // Hook personalizado para adicionar música à fila
  const {
    handleClick, handleCloseModal, handleConfirmAddTrack, isAddingTrack, isDebouncing,
    memoizedSearchResults, memoizedTopTracksInBrazil,selectedMusic, showModal
  } = useAddMusicToQueue(search, token, setPopupMessageData);

  return (
    <Container
      className='add-music-route'
      onTouchStart={ handleTouchStart } // Adiciona evento de toque inicial
      onTouchMove={ handleTouchMove } // Adiciona evento de movimento do toque
      onTouchEnd={ handleTouchEnd } // Adiciona evento de toque final
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={ <Spinner /> }>
        { /* Modal de confirmação de adição de música */ }
        <AddMusicConfirmationModal
          onHide={ handleCloseModal } // Função para fechar o modal
          handleConfirm={ handleConfirmAddTrack } // Função para confirmar a adição da música
          isAddingTrack={ isAddingTrack } // Estado de carregamento da adição da música
          selectedMusic={ selectedMusic } // Música selecionada para adicionar à fila
          show={ showModal } // Estado de visibilidade do modal
        />
        {/* Popup de mensagem */ }
        <MessagePopup
          data={ popupMessageData }
          onHide={() => setPopupMessageData({ ...popupMessageData, show: false })}
        />
        { /* Popup de alteração de ranking */ }
        <RankingChangePopup
          currentRanking={ djs } // Envia o ranking atual como prop
          dj={ dj } // Envia o DJ atual como prop
          ownerDJId={ ownerDJId }
          onHide={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
          previousRanking={ previousRanking } // Envia o ranking anterior como prop
          show={ showRankingChangePopup } // Envia o estado do popup como prop
          trackName={ trackName } // Nome da pista'
        />
        { /* Popup de votação */ }
        <VotePopup
          djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
          onHide={ () => setShowVotePopup(false) } // Função para fechar o popup
          playingNow={ playingNow } // Envia o estado de reprodução como prop
          show={ showVotePopup } // Envia o estado do popup como prop
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Se sim, exibe o logo de carregamento
        <Container
          className='d-flex justify-content-center align-items-center add-music-to-queue-container' // Classes para centralizar o conteúdo
 // Define a altura do container como 100% da altura da tela
        >
          <Image
            alt='Logo de carregamento' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamento
            src={ logo } // Caminho da imagem
          />
        </Container>
      ) : (
        <Container className='add-music-page gradient-border add-music-to-queue-add-music-page'>
          { /* Renderiza o cabeçalho */ }
          <Header
            currentRanking={ djs } // Envia o ranking atual como prop
            dj={ dj } // Envia o DJ atual como prop
            onSettingsChange={ setQueueSettings }
            queueSettings={ queueSettings }
            refreshTrackSettings={ refreshTrackSettings }
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
            setTrackName={ setTrackName }
            showVotePopup={ showVotePopup } // Envia o estado do popup de votação
            token={ token } // Envia o token do DJ como prop
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista como prop
            trackName={ trackName } // Envia o nome da pista como prop
          />
          <Row className='add-music-layout'>
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
            <Col 
              className='py-4 add-music-main-column' // Adiciona padding vertical
              // Largura para diferentes tamanhos de tela
              md={ 12 }  lg={ 12 }  xl={ 12 } xxl={ 9 } // Define a largura da coluna em telas grandes
            >
              { /* Card que contém a lista de músicas */ }
              <Card className='text-center text-light gradient-border add-music-panel'>
                <Card.Body
                  className='add-music-panel-body'
                >
                  { /* Campo de pesquisa para buscar músicas */ }
                  <Form.Control
                    className='my-3 custom-input add-music-search add-music-to-queue-my-3' // Classe para o campo de pesquisa
                    placeholder='Que música você quer adicionar à fila?' // Placeholder do campo de pesquisa
                    onChange={ handleChange } // Função chamada ao alterar o valor do campo de pesquisa
                    // Estilo para o campo de pesquisa
                    style={{ 
                      color: 'white', 
                      position: 'sticky', 
                      textAlign: 'center', 
                      top: '0px', 
                      zIndex: 1000 
                    }}
                    type='text' 
                    value={ search } 
                  />
                  <TrackGrid
                    handleClick={ handleClick } 
                    isDebouncing={ isDebouncing } 
                    memoizedSearchResults={ memoizedSearchResults } 
                    memoizedTopTracksInBrazil={ memoizedTopTracksInBrazil } 
                    queueOpen={ queueSettings?.queueOpen ?? true }
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </Container>
  );
}

// Função para mapear o estado do Redux para as props do componente
const mapStateToProps = (state: RootState) => ({
  token: state.reducer.token // Mapeia o token do DJ do estado global para as props do componente
});

const AddMusicToQueueConnected = connect(mapStateToProps)(AddMusicToQueue); // Conecta o componente ao Redux

export default AddMusicToQueueConnected; // Exporta o componente conectado ao Redux
