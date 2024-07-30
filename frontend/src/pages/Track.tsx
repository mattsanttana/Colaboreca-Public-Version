import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import PlayingNow from '../types/PlayingNow';
import DJ from '../types/DJ';
import PlaybackState from './PlaybackState';
import Podium from './Podium';
import Menu from './Menu';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';
import { RootState } from '../redux/store';
import Queue from './Queue';
import Header from './Header';

interface Props {
    token: string;
}

const Track: React.FC<Props> = ({ token }) => {
    const { trackId } = useParams();
    const [trackFound, setTrackFound] = useState(false);
    const [djs, setDjs] = useState<DJ[]>([]);
    const [dj, setDj] = useState<DJ>();
    const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                        fetchedDjs,
                        fetchedDJ,
                        fetchedPlayingNow
                    ] = await Promise.all([
                        trackActions.getTrackById(trackId),
                        djActions.getAllDJs(trackId),
                        djActions.getDJByToken(token),
                        playbackActions.getState(trackId)
                    ]);
                    
                    if (fetchedDJ.message === 'Invalid token') {
                        navigate('/enter-track')
                    }

                    if (fetchedTrack?.status === 200) {
                        setPlayingNow(fetchedPlayingNow);
                        setDjs(fetchedDjs);
                        setDj(fetchedDJ);
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
        isLoading ? (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <h1 className='text-light'>Carregando</h1>
                <Spinner animation="border" className='text-light'/>
            </Container>
        ) :
        trackFound && dj ? (
            <Container>
                <Header />
                <Row>
                    <Col md={3}>
                        <Menu dj={dj} />
                    </Col>
                    <Col md={6} className="d-flex flex-column align-items-center">
                        <PlaybackState playingNow={playingNow} isOwner={false} />
                    </Col>
                    <Col md={3}>
                        <Podium djs={djs} isOwner={false} trackId={trackId} />
                        <Queue />
                    </Col>
                </Row>
            </Container>
        ) : (
            <Container className="text-center">
                <h1>Esta pista não existe</h1>
                <Button onClick={() => navigate("/")}>Página inicial</Button>
            </Container>
        )
    );
};

const mapStateToProps = (state: RootState) => ({
    token: state.djReducer.token
});

const TrackConnected = connect(mapStateToProps)(Track);

export default TrackConnected;
