import { lazy, Suspense, useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Card, Table, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';
import { RootState } from '../redux/store';
import MessagePopup from './MessagePopup';
import { logo } from '../assets/images/characterPath'
import RankingChangePopup from './RankingChangePopup';
import usePlayback from '../utils/usePlayback';
import useFetchTrackData from '../utils/useFetchTrackData';
import useFetchPlaybackData from '../utils/useFetchPlaybackData';
import useMenu from '../utils/useMenu';
import { DJMusic } from '../types/SpotifySearchResponse';
import useDJ from '../utils/useDJ';
import { DJ } from '../types/DJ';
import TrackInfoPopup from './TrackInfoPopup';
import DJInfoPopup from './DJInfoPopup';
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  djToken: string;
  trackToken: string;
}

const DJProfile: React.FC<Props> = ({ djToken, trackToken }) => {
  const { trackId, djId } = useParams()
  const [ musics, setMusics ] = useState<DJMusic[]>([]);
  const [ filter, setFilter ] = useState<string>('1');
  const [ djProfile, setDJProfile ] = useState<DJ>();
  const [ showTrackInfoPopup, setShowTrackInfoPopup ] = useState(false) // Estado para controlar o popup de informações da pista
  const [ isProfileOwner, setIsProfileOwner ] = useState(false) // Estado para controlar se o usuário é o dono do perfil
  const [ showDJInfoPopup, setShowDJInfoPopup ] = useState(false) // Estado para controlar o popup de informações do DJ

  const djActions = useDJ(); // Hook personalizado para ações do DJ
  const playbackActions = usePlayback();

  // Hook personalizado para buscar dados da pista
  const {
    dj, djs, isTrackOwner, popupMessageData, previewRanking, setPopupMessageData, setShowRankingChangePopup, setTrackName, showRankingChangePopup, trackName
  } = useFetchTrackData(trackId, djToken, trackToken);

  // Hook personalizado para buscar dados de reprodução
  const {
    djPlayingNow, isLoading, playingNow, setShowVotePopup, showVotePopup
  } = useFetchPlaybackData(trackId, djToken)
  
  const { isMenuOpen, handleTouchEnd, handleTouchMove, handleTouchStart, setIsMenuOpen } = useMenu() // Hook personalizado para lidar com o menu

  useEffect(() => {
    const fetchMusicsData = async () => {
      if (trackId) {
        const [ fetchedDJProfile, fetchedVerifyIfDJIsOwner, fetchedMusics, ] = await Promise.all([
          djActions.getDJById(djId, trackId),
          djActions.verifyIfTheDJIsTheProfileOwner(djId, trackId),
          playbackActions.getAddedMusicsByDJ(djId, djToken)
        ])

        if(fetchedDJProfile?.status !== 200) {
          setPopupMessageData({
            message: 'Algo deu errado ao buscar o DJ, por favor tente novamente mais tarde.',
            redirectTo: isTrackOwner ? `/track-info/${trackId}` : `/track/${trackId}`,
            show: true
          })
        } else {
          setDJProfile(fetchedDJProfile.data);
          setIsProfileOwner(fetchedVerifyIfDJIsOwner ?? false);
          setMusics(fetchedMusics);
        }
      }
    }

    fetchMusicsData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playedMusics = musics.filter((music) => music.wasPlayed);
  const notPlayedMusics = musics.filter((music) => !music.wasPlayed);

  return (
    <Container
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      { /* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */ }
      <Suspense fallback={<Spinner />}>
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
          showVotePopup={ showVotePopup } // Envia o estado do popup como prop
          setShowVotePopup={ setShowVotePopup }  // Função para fechar o popup
          playingNow={ playingNow } // Envia o estado de reprodução como prop
          djPlayingNow={ djPlayingNow } // Envia o DJ que está tocando a música atual como prop
        />
        <DJInfoPopup
          dj={dj} // Envia o DJ atual como prop
          djToken={djToken} //Envia o token do DJ atual como prop
          setShow={setShowDJInfoPopup} // Função para definir o estado do popup
          show={showDJInfoPopup} // Estado do popup de informações do DJ
        />
      </Suspense>
      { /* Verifica se está carregando */ }
      {isLoading ? (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <img src={logo} alt="Loading Logo" className="logo-spinner" />
        </Container>
      ) : (
        <div>
          <Header
              dj={ dj } // Envia o DJ atual como prop
              isSlideMenuOpen={ isMenuOpen } // Envia o estado do menu como prop
              isTrackOwner={ isTrackOwner } // Envia se o usuário é o dono da pista como prop
              showTrackInfoPopup={ setShowTrackInfoPopup } // Função para abrir o popup de informações da pista
              toggleMenu={ setIsMenuOpen } // Função para alternar o estado do menu
            />
          <Row>
            <Col md={ 3 } className='d-none d-xxl-block'>
              { /* Componente de menu */ }
              <Menu dj={ dj } isTrackOwner={ isTrackOwner } /> { /* Envia o DJ atual como prop */ }
            </Col>
            <Col className="py-4" md={12} lg={12} xl={12} xxl={9}>
              <Card
                className="text-center"
                style={{ backgroundColor: '#000000', padding: '0' }}
              >
                <Card.Img
                  variant="top"
                  src={ djProfile?.characterPath }
                  className="img-fluid rounded-circle mb-3"
                  style={{ width: '300px', margin: '0 auto' }}
                />
                <div className="d-flex justify-content-center align-items-center mb-3">
                <div className={`rank-square ${djProfile?.ranking === 1 ? 'gold' : djProfile?.ranking === 2 ? 'silver' : djProfile?.ranking === 3 ? 'bronze' : ''}`}>
                    {djProfile?.ranking ? `${djProfile.ranking}º` : '-'}
                  </div>
                    <div className="name-square mx-3">{djProfile?.djName}</div>
                    <div className="points-square">{djProfile?.score} pts</div>
                  </div>
                  {isProfileOwner && !isTrackOwner && (
                    <Button variant="primary" style={{marginLeft: '25%', width: '50%', marginTop: '10px'}} onClick={() => setShowDJInfoPopup(true)}>
                      Editar/Excluir DJ
                    </Button>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px' }}>
                      <Form.Select
                        className='text-light'
                        style={{ backgroundColor: '#000000', width: '140px' }}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="1">Todas</option>
                        <option value="2">Tocadas</option>
                        <option value="3">Não tocadas</option>
                      </Form.Select>
                    </div>
                <Card.Body style={{height: '36vh', overflow: 'auto'}}>
                  <Card.Title className="mt-4 text-light" style={{ margin: '10px' }}>Músicas adicionadas:</Card.Title>
                    {musics.length > 0 ? (
                      <div className='table-responsive'>
                        <Table striped className='text-light'>
                          <thead>
                            <tr>
                              <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Música</th>
                              <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Artista</th>
                              <th className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>Capa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filter === '1' ? (
                              musics.map((music, index) => (
                                <tr key={index}>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.name}</td>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.artists}</td>
                                  <td style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                                    <img
                                      src={music.cover}
                                      alt={music.name}
                                      className='img-thumbnail'
                                      style={{ width: '60px', height: '60px', backgroundColor: '#000000' }}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : filter === '2' ? (
                              playedMusics.map((music, index) => (
                                <tr key={index}>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.name}</td>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.artists}</td>
                                  <td style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                                    <img
                                      src={music.cover}
                                      alt={music.name}
                                      className='img-thumbnail'
                                      style={{ width: '60px', height: '60px', backgroundColor: '#000000' }}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              notPlayedMusics.map((music, index) => (
                                <tr key={index}>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.name}</td>
                                  <td className='text-light' style={{ backgroundColor: '#000000', borderBottom: 'none' }}>{music.artists}</td>
                                  <td style={{ backgroundColor: '#000000', borderBottom: 'none' }}>
                                    <img
                                      src={music.cover}
                                      alt={music.name}
                                      className='img-thumbnail'
                                      style={{ width: '60px', height: '60px', backgroundColor: '#000000' }}
                                    />
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                    </div>
                  ) : (
                    <div>
                      <h4 className='text-light' style={{ margin: '100px' }}>Nenhuma música adicionada.</h4>
                    </div>
                  )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
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
