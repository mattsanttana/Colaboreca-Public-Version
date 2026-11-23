import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/Home';
import Login from './pages/access/LoginPopup';
import NotFound from './pages/shared/NotFound';
import DJs from './pages/ranking/Ranking';
import Track from './pages/tracks/Track';
import DJProfile from './pages/djs/DJProfile';
import AddMusicToQueue from './pages/queue/AddMusicToQueue';
import Queue from './pages/queue/Queue';
import Chat from './pages/chat/Chat';
import EnterTrack from './pages/tracks/EnterTrack';
import CreateDJ from './pages/djs/CreateDJ';

// Componente principal do aplicativo onde as rotas são definidas
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/enter-track" element={<EnterTrack />} />
      <Route path="/enter-track/:trackIdParam" element={<EnterTrack />} />
      <Route path="/create-dj/:trackId" element={<CreateDJ />} />
      <Route path="/track-info/:trackId" element={<Track />} />
      <Route path="/track-info/djs/:trackId" element={<DJs />} />
      <Route path="/track-info/profile/:trackId/:djId" element={<DJProfile />} />
      <Route path="/track-info/queue/:trackId" element={<Queue />} />
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
