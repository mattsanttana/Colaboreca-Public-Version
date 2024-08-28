import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import EnterTrack from './pages/EnterTrack';
import NotFound from './pages/NotFound';
import DJsConnected from './pages/DJs';
import TrackInfoConnected from './pages/TrackInfo';
import TrackConnected from './pages/Track';
import DJProfileConnected from './pages/DJProfile';
import AddMusicToQueueConnected from './pages/AddMusicToQueue';
import QueueConnected from './pages/Queue';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/enter-track" element={<EnterTrack />} />
      <Route path="/track-info/:trackId" element={<TrackInfoConnected />} />
      <Route path="/track-info/djs/:trackId" element={<DJsConnected />} />
      <Route path="/track-info/profile/:trackId/:djId" element={<DJProfileConnected />} />
      <Route path="/track/:trackId" element={<TrackConnected />} />
      <Route path="/track/ranking/:trackId" element={<DJsConnected />} />
      <Route path="/track/profile/:trackId/:djId" element={<DJProfileConnected />} />
      <Route path="/track/add-music/:trackId" element={<AddMusicToQueueConnected />} />
      <Route path="/track/queue/:trackId" element={<QueueConnected />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
