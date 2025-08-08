import { lazy, Suspense, useState } from 'react';
import { Card, Col, Container, Form, Image, Row, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import Header from './Header';
import Menu from './Menu';
import { logo } from '../assets/images/characterPath';
import { RootState } from '../redux/store';
// import { Music } from '../types/SpotifySearchResponse';
import useMenu from '../utils/useMenu';
import useFetchTrackData from '../utils/useFetchTrackData';
import useFetchPlaybackData from '../utils/useFetchPlaybackData';
import TrackInfoPopup from './TrackInfoPopup';
import useAddMusicToQueue from '../utils/useAddMusicToQueue';
import TrackGrid from './AddTrackGrid';

// Componentes que não precisam ser carregados inicialmente
const AddMusicConfirmationModal = lazy(() => import('./AddMusicConfirmationPopup'));
const MessagePopup = lazy(() => import('./MessagePopup'));
const RankingChangePopup = lazy(() => import('./RankingChangePopup'));
const VotePopup = lazy(() => import('./VotePopup'));

// Props recebidas pelo redux
interface Props {
  djToken: string; // Token do DJ
}

// Componente principal da página de adicionar música à fila
const AddMusicToQueue: React.FC<Props> = ({ djToken }) => {
  const [search, setSearch] = useState(''); // Estado para armazenar o texto de pesquisa

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup,
    setShowTrackInfoPopup, setTrackName, showRankingChangePopup, showTrackInfoPopup, trackId, trackName
  } = useFetchTrackData(djToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData(djToken);

  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu(); // Hook personalizado para lidar com o menu

  // Função para lidar com a mudança no campo de pesquisa
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value); // Atualiza o estado de pesquisa com o valor do campo de entrada
  }

  // Hook personalizado para adicionar música à fila
  const {
    handleClick, handleCloseModal, handleConfirmAddTrack, isAddingTrack, isDebouncing,
    memoizedSearchResults, memoizedTopTracksInBrazil,selectedMusic, showModal
  } = useAddMusicToQueue(search, djToken, setPopupMessageData);

  return (
    <Container
      onTouchStart={ handleTouchStart } // Adiciona evento de toque inicial
      onTouchMove={ handleTouchMove } // Adiciona evento de movimento do toque
      onTouchEnd={ handleTouchEnd } // Adiciona evento de toque final
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={ <Spinner /> }>
        { /* Modal de confirmação de adição de música */ }
        <AddMusicConfirmationModal
          handleClose={ handleCloseModal } // Função para fechar o modal
          handleConfirm={ handleConfirmAddTrack } // Função para confirmar a adição da música
          isAddingTrack={ isAddingTrack } // Estado de carregamento da adição da música
          selectedMusic={ selectedMusic } // Música selecionada para adicionar à fila
          show={ showModal } // Estado de visibilidade do modal
        />
        {/* Popup de mensagem */ }
        <MessagePopup
          data={ popupMessageData }
          handleClose={() => setPopupMessageData({ ...popupMessageData, show: false })}
        />
        { /* Popup de alteração de ranking */ }
        <RankingChangePopup
          currentRanking={ djs } // Envia o ranking atual como prop
          dj={ dj } // Envia o DJ atual como prop
          handleClose={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
          previousRanking={ previewRanking } // Envia o ranking anterior como prop
          showRankingChangePopup={ showRankingChangePopup } // Envia o estado do popup como prop
        />
        { /* Popup de informações da pista */ }
        <TrackInfoPopup
          trackName={ trackName } // Nome da pista
          setTrackName={ setTrackName } // Função para definir o nome da pista
          show={ showTrackInfoPopup } // Estado do popup de informações da pista
          setShow={ setShowTrackInfoPopup } // Função para definir o estado do popup
        />
        { /* Popup de votação */ }
        <VotePopup
          djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
          handleClose={ () => setShowVotePopup(false) } // Função para fechar o popup
          playingNow={ playingNow } // Envia o estado de reprodução como prop
          showVotePopup={ showVotePopup } // Envia o estado do popup como prop
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      { isLoading ? (
        // Se sim, exibe o logo de carregamento
        <Container
          className='d-flex justify-content-center align-items-center' // Classes para centralizar o conteúdo
          style={{ height: '100vh' }} // Define a altura do container como 100% da altura da tela
        >
          <Image
            alt='Logo de carregamento' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamento
            src={ logo } // Caminho da imagem
          />
        </Container>
      ) : (
        <Container style={{ position: 'relative' }}>
          { /* Renderiza o cabeçalho */ }
          <Header
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ showVotePopup ? false : isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
            setShowTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista atual'
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
            <Col 
              className='py-4' // Adiciona padding vertical
              // Largura para diferentes tamanhos de tela
              md={ 12 }  lg={ 12 }  xl={ 12 } xxl={ 9 } // Define a largura da coluna em telas grandes
            >
              { /* Card que contém a lista de músicas */ }
              <Card
                className='text-center text-light' // Classes para centralizar o texto e definir a cor do texto
                style={{ boxShadow: '0 0 0 0.5px #ffffff' }} // Estilo para a sombra do card
              >
                <Card.Body
                  className='hide-scrollbar' // Classe para esconder a barra de rolagem
                  // Estilo para o corpo do card
                  style={{
                    height: '90vh', // Altura do corpo do card
                    overflowY: 'auto', // Permite rolagem vertical
                    padding: '0px', // Remove o padding padrão
                    position: 'relative', // Permite posicionamento absoluto de elementos filhos
                    width: '100%' // Largura do corpo do card
                  }}
                >
                  { /* Campo de pesquisa para buscar músicas */ }
                  <Form.Control
                    className='my-3 search-input' // Classe para o campo de pesquisa
                    placeholder='Que música você quer adicionar à fila?' // Placeholder do campo de pesquisa
                    onChange={ handleChange } // Função chamada ao alterar o valor do campo de pesquisa
                    // Estilo para o campo de pesquisa
                    style={{ 
                      backgroundColor: '#000000', // Cor de fundo preta
                      color: 'white', // Cor do texto
                      position: 'sticky', // Fixa o campo no topo ao rolar
                      textAlign: 'center', // Alinha o texto no centro
                      top: '0px', // Posiciona o campo no topo
                      zIndex: 1000 // Z-index para garantir que fique acima de outros elementos
                    }}
                    type='text' // Tipo do campo de entrada
                    value={ search } // Valor do campo de entrada
                  />
                  <TrackGrid
                    handleClick={ handleClick } // Função chamada ao clicar em uma música
                    isDebouncing={ isDebouncing } // Estado de debouncing para evitar chamadas excessivas
                    memoizedSearchResults={ memoizedSearchResults } // Resultados da pesquisa de músicas
                    memoizedTopTracksInBrazil={ memoizedTopTracksInBrazil } // Músicas mais populares no Brasil
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
  djToken: state.djReducer.token // Mapeia o token do DJ do estado global para as props do componente
});

const AddMusicToQueueConnected = connect(mapStateToProps)(AddMusicToQueue); // Conecta o componente ao Redux

export default AddMusicToQueueConnected; // Exporta o componente conectado ao Redux