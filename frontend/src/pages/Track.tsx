import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { RootState } from '../redux/store';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';
import PlaybackState from './PlaybackState';
import Podium from './Podium';
import Menu from './Menu';
import QueuePreview from './QueuePreview';
import Header from './Header';
import MessagePopup from './MessagePopup';
import PlayingNow from '../types/PlayingNow';
import { DJ, DJPlayingNow } from '../types/DJ';
import { Music } from '../types/SpotifySearchResponse';

interface Props {
  token: string;
}

const Track: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const [trackFound, setTrackFound] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [djs, setDJs] = useState<DJ[]>([]);
  const [dj, setDJ] = useState<DJ>();
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [queue, setQueue] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const djActions = useDJ();
  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const navigate = useNavigate();
  const intervalId1 = useRef<null | NodeJS.Timeout>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const [
            fetchedTrack,
            fetchedVerifyLogin,
            fetchedDJs,
            fetchedDJ,
            fetchedPlayingNow,
            fetchedDJPlayingNow,
            fetchedQueue
          ] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(token),
            djActions.getAllDJs(trackId),
            djActions.getDJByToken(token),
            playbackActions.getState(trackId),
            playbackActions.getDJAddedCurrentMusic(trackId),
            playbackActions.getSpotifyQueue(trackId)
          ]);

          if (fetchedVerifyLogin?.status !== 200) {
            setPopupMessage('Você não está logado, por favor faça login novamente');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedDJ?.status !== 200) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedTrack?.status === 200) {
            setPlayingNow(fetchedPlayingNow);
            setDJs(fetchedDJs);
            setDJ(fetchedDJ?.data);
            setQueue(fetchedQueue);
            setTrackName(fetchedTrack.data.trackName);
            setDJPlayingNow(fetchedDJPlayingNow);
            setTrackFound(true);
          } else {
            setTrackFound(false);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    intervalId1.current = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      if (intervalId1.current) clearInterval(intervalId1.current);
    };
  }, [djActions, playbackActions, token, trackActions, trackId, navigate]);

  return (
    <>
      <MessagePopup
        show={showPopup}
        handleClose={() => setShowPopup(false)}
        message={popupMessage}
        redirectTo={redirectTo}
      />
      {isLoading ? (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <h1 className='text-light'>Carregando</h1>
          <Spinner animation="border" className='text-light' />
        </Container>
      ) : trackFound && dj ? (
        <Container>
          <Header dj={dj}/>
          {/* Menu deslizante */}
          <Row>
            {/* Menu fixo para desktop */}
            <Col md={3} className="d-none d-md-block">
              <Menu dj={dj} />
            </Col>

            <Col md={6} className="d-flex flex-column align-items-center playback-state-container">
              <PlaybackState playingNow={playingNow} trackName={trackName} dj={djPlayingNow} />
            </Col>

            {/* Podium e QueuePreview ocultos no mobile */}
            <Col md={3} className="d-none d-md-block">
              <div className="podium-container">
                <Podium
                  djs={djs}
                  isOwner={false}
                  trackId={trackId}
                  hasDJs={djs.length > 0}
                />
              </div>
              <div className="queue-container">
                <QueuePreview trackId={trackId} queue={queue} />
              </div>
            </Col>
          </Row>
        </Container>
      ) : (
        <Container className="text-center">
          <h1>Esta pista não existe</h1>
          <Button onClick={() => navigate("/")}>Página inicial</Button>
        </Container>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const TrackConnected = connect(mapStateToProps)(Track);

export default TrackConnected;
