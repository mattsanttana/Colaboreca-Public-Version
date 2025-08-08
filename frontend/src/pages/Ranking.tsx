import { lazy, Suspense, } from 'react';
import { Container, Col, Row, Card, OverlayTrigger, Tooltip, Spinner, Image } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import { connect } from 'react-redux';
import Header from './Header';
import Menu from './Menu';
import Podium from './Podium';
import { logo } from '../assets/images/characterPath';
import { RootState } from '../redux/store';
import useFetchTrackData from '../utils/useFetchTrackData';
import useFetchPlaybackData from '../utils/useFetchPlaybackData';
import useMenu from '../utils/useMenu';
import RankingTable from './RankingTable';

// Componentes que não precisam ser carregados inicialmente
const MessagePopup = lazy(() => import('./MessagePopup'));
const RankingChangePopup = lazy(() => import('./RankingChangePopup'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  djToken: string;
  trackToken: string;
}

const Ranking: React.FC<Props> = ({ djToken, trackToken }) => {
  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup, setShowTrackInfoPopup, showRankingChangePopup, trackId
  } = useFetchTrackData(djToken, trackToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup,
  } = useFetchPlaybackData(djToken);

  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu(); // Hook personalizado para lidar com o menu

  return (
    <Container
      onTouchStart={ handleTouchStart }
      onTouchMove={ handleTouchMove }
      onTouchEnd={ handleTouchEnd }
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={ <Spinner /> }>
        {/* Popup de mensagem */ }
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          handleClose={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
        { !isTrackOwner && (
          <>
            { /* Popup de alteração de ranking */ }
            <RankingChangePopup
              currentRanking={ djs } // Envia o ranking atual como prop
              dj={ dj } // Envia o DJ atual como prop
              handleClose={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
              previousRanking={ previewRanking } // Envia o ranking anterior como prop
              showRankingChangePopup={ showRankingChangePopup } // Envia o estado do popup como prop
            />
            { /* Popup de votação */ }
            <VotePopup
              djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
              handleClose={ () => setShowVotePopup(false) } // Função para fechar o popup
              playingNow={ playingNow } // Envia o estado de reprodução como prop
              showVotePopup={ showVotePopup } // Envia o estado do popup como prop
            />
          </>
        )}
      </Suspense>
      { isLoading ? (
        <Container
          className='d-flex justify-content-center align-items-center'
          style={{ height: '100vh' }}
        >
          <Image
            alt='Logo de carregamento' // Texto alternativo
            className='logo-spinner' // Classe de animação de carregamento
            src={ logo } // Caminho da imagem
          />
        </Container>
      ) : (
        <Container>
          <Header
            dj={ dj } // Envia o DJ atual como prop
            isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
            setShowTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
            showVotePopup={ showVotePopup } // Envia o estado do popup de votação
            toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            trackId={ trackId } // Envia o ID da pista como prop
          />
          <Row>
            { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Col
              className='d-none d-xxl-block' // Esconde o menu lateral em telas menores
              md={ 3 } // Define a largura do menu lateral em telas maiores
            >
              { /* Componente de menu */ }
              <Menu
                dj={ dj } // Envia o DJ atual como prop
                isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
                trackId={ Number(trackId) } // Envia o ID da pista como prop
              />
            </Col>
            <Col className='py-4'>
              { /* Renderiza o conteúdo principal da página */ }
              <Card className='text-center text-light'>
                <Card.Body
                  // Estilo do corpo do card
                  style={{
                    backgroundColor: 'transparent', // Cor de fundo do card
                    padding: '0', // Remove o padding do card
                    height: '100%', // Altura do card
                    overflowY: 'hidden', // Permite rolagem vertical
                    width: '100%' // Largura do card
                  }}
                >
                  { /* Renderiza o pódio com os DJs */ }
                  <Row
                    sm={ 3 } md={ 1 } lg={ 1 } xl={ 3 } xxl={ 3 } // Define o layout responsivo
                    style={{ width: '90%', marginLeft: '7%' }} // Define a largura e margem do pódio
                  >
                    { /* Componente de pódio */ }
                    <Podium
                      djs={ djs } // Envia a lista de DJs como prop
                    />
                  </Row>
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip>
                        Os DJs são classificados com base na pontuação que acumulam ao longo da competição.

                        Critérios de desempate:
                        1º critério: O DJ com mais votos positivos ou menos votos negativos terá vantagem.
                        2º critério: Se o empate persistir, quem alcançou a pontuação empatada primeiro ocupará a posição mais alta.
                        {
                          !isTrackOwner && (
                            'Use sua criatividade para conquistar votos e subir no ranking! 🎵'
                          )
                        }
                      </Tooltip>
                    }
                  >
                    { /* Ícone de ajuda com tooltip */ }
                    <span
                      className='ms-2' // Margem esquerda para espaçamento
                      // Estilo do ícone de ajuda
                      style={{ 
                        marginTop: '-10%', // Ajusta a posição vertical do ícone
                        position: 'absolute', // Posiciona o ícone de ajuda
                        right: 40 // Alinha o ícone à direita
                      }}
                    >
                      <FaQuestionCircle style={{ cursor: 'pointer', color: '#ffffff' }} /> {/* Ícone de ajuda*/ }
                    </span>
                  </OverlayTrigger>
                  <div
                    style={{
                      height: 'calc(100% - 350px)', // ajuste 240px para a altura real do seu slider
                      overflowY: 'auto', // Define a barra de rolagem vertical
                      overflowX: 'hidden' // Esconede a barra de rolagem horizontal
                    }}
                  >
                    { /* Caso não haja DJs na sala, exibe uma mensagem */ }
                    { djs?.length === 0 ? (
                      <Card.Text>Nenhum DJ entrou na sala.</Card.Text>
                    ) : (    
                      // Caso contrário, exibe a tabela com os DJs      
                      <RankingTable
                        djs={ djs } // Envia a lista de DJs como prop
                        isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
                        trackId={ Number(trackId) } // Envia o ID da pista como prop
                        trackToken={ trackToken } // Envia o token da pista como prop
                      />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </Container>
  );
};

// Mapeia o estado do Redux para as props do componente Ranking
const mapStateToProps = (state: RootState) => ({
  djToken: state.djReducer.token, // Token do DJ
  trackToken: state.trackReducer.token // Token da pista
});

const RankingConnected = connect(mapStateToProps)(Ranking); // Conecta o componente Ranking ao Redux

export default RankingConnected; // Exporta o componente conectado ao Redux
