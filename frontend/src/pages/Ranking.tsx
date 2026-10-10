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
  token: string;
}

const Ranking: React.FC<Props> = ({ token }) => {
  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, globalPreviousRanking, ownerDJId, popupMessageData, previousRanking, setPopupMessageData,
    queueSettings, refreshTrackSettings, setQueueSettings, setShowRankingChangePopup, setTrackName, showRankingChangePopup, trackId, trackName
  } = useFetchTrackData(token);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup,
  } = useFetchPlaybackData(token);

  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu(); // Hook personalizado para lidar com o menu

  return (
    <Container
      className='ranking-route'
      onTouchStart={ handleTouchStart }
      onTouchMove={ handleTouchMove }
      onTouchEnd={ handleTouchEnd }
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={ <Spinner /> }>
        {/* Popup de mensagem */ }
        <MessagePopup
          data={ popupMessageData } // Dados da mensagem
          onHide={ () => setPopupMessageData({ ...popupMessageData, show: false }) } // Função para fechar o popup
        />
          { /* Popup de alteração de ranking */ }
          <RankingChangePopup
            currentRanking={ djs } // Envia o ranking atual como prop
            dj={ dj } // Envia o DJ atual como prop
            ownerDJId={ ownerDJId }
            onHide={ () => setShowRankingChangePopup(false) } // Função para fechar o popup
            previousRanking={ previousRanking } // Envia o ranking anterior como prop
            show={ showRankingChangePopup } // Envia o estado do popup como prop
            trackName={ trackName } // Nome da pista
          />
          { /* Popup de votação */ }
          <VotePopup
            djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
            onHide={ () => setShowVotePopup(false) } // Função para fechar o popup
            playingNow={ playingNow } // Envia o estado de reprodução como prop
            show={ showVotePopup } // Envia o estado do popup como prop
          />
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
        <Container className='ranking-page gradient-border'>
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
          <Row className='ranking-layout'>
            { /* Renderiza o menu lateral (somente para telas não-mobile) */ }
            <Col
              className='d-none d-xxl-block' // Esconde o menu lateral em telas menores
              md={ 3 } // Define a largura do menu lateral em telas maiores
            >
              { /* Componente de menu */ }
              <Menu
                currentRanking={ djs } // Envia o ranking atual como prop
                dj={ dj } // Envia o DJ atual como prop
                previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
                trackId={ Number(trackId) } // Envia o ID da pista como prop
              />
            </Col>
            <Col className='py-4 ranking-main-column'>
              { /* Renderiza o conteúdo principal da página */ }
              <Card className='text-center text-light gradient-border ranking-panel'>
                <Card.Body className='ranking-panel-body'>
                  { /* Renderiza o pódio com os DJs */ }
                  <Row className='ranking-podium-row' sm={ 3 } md={ 1 } lg={ 1 } xl={ 3 } xxl={ 3 }>
                    { /* Componente de pódio */ }
                    <Podium
                      djs={ djs } // Envia a lista de DJs como prop
                      featured
                      trackName={ trackName }
                    />
                  </Row>
                  <OverlayTrigger
                    placement='bottom'
                    overlay={
                      <Tooltip className='custom-modal'>
                        Os DJs são classificados com base na pontuação que acumulam ao longo da competição.

                        Critérios de desempate:
                        1º critério: O DJ com mais votos positivos ou menos votos negativos terá vantagem.
                        2º critério: Se o empate persistir, quem alcançou a pontuação empatada primeiro ocupará a posição mais alta.

                        Use sua criatividade para conquistar votos e subir no ranking! 🎵
                      </Tooltip>
                    }
                  >
                    { /* Ícone de ajuda com tooltip */ }
                    <span className='ranking-help'>
                      <FaQuestionCircle style={{ cursor: 'pointer', color: '#ffffff' }} /> {/* Ícone de ajuda*/ }
                    </span>
                  </OverlayTrigger>
                  <div className='ranking-table-scroll'>
                    { /* Caso não haja DJs na sala, exibe uma mensagem */ }
                    { djs?.length === 0 ? (
                      <Card.Text>Nenhum DJ entrou na sala.</Card.Text>
                    ) : (    
                      // Caso contrário, exibe a tabela com os DJs      
                      <RankingTable
                        dj={ dj }
                        currentRanking={ djs } // Envia o ranking atual como prop
                        ownerDJId={ ownerDJId }
                        previousRanking={ globalPreviousRanking } // Envia o ranking anterior como prop
                        trackToken={ token } // Envia o token da pista como prop
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
  token: state.reducer.token, // Token do DJ
});

const RankingConnected = connect(mapStateToProps)(Ranking); // Conecta o componente Ranking ao Redux

export default RankingConnected; // Exporta o componente conectado ao Redux
