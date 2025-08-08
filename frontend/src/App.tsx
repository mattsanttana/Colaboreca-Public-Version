import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import DJs from './pages/Ranking';
import Track from './pages/Track';
import DJProfile from './pages/DJProfile';
import AddMusicToQueue from './pages/AddMusicToQueue';
import Queue from './pages/Queue';
import Chat from './pages/Chat';
import EnterTrack from './pages/EnterTrack';

// Componente principal do aplicativo onde as rotas são definidas
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/enter-track" element={<EnterTrack />} />
      <Route path="/enter-track/:trackIdParam" element={<EnterTrack />} />
      <Route path="/track-info/:trackId" element={<Track />} />
      <Route path="/track-info/djs/:trackId" element={<DJs />} />
      <Route path="/track-info/profile/:trackId/:djId" element={<DJProfile />} />
      <Route path="/track-info/queue/:trackId" element={<Queue  />} />
      <Route path="/track-info/ranking/:trackId" element={<DJs />} />
      <Route path="/track/:trackId" element={<Track />} />
      <Route path="/track/ranking/:trackId" element={<DJs />} />
      <Route path="/track/profile/:trackId/:djId" element={<DJProfile />} />
      <Route path="/track/add-music/:trackId" element={<AddMusicToQueue />} />
      <Route path="/track/queue/:trackId" element={<Queue />} />
      <Route path="/track/chat/:trackId" element={<Chat />} />
      <Route path="/track/chat/:trackId/:djChat" element={<Chat />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
