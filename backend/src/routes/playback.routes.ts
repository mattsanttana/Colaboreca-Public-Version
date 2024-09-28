import { Router } from 'express';
import PlaybackController from '../controllers/PlaybackController';
import Validations from '../middlewares/Validations';

const playbackController = new PlaybackController();

const router = Router();

router.get(
  '/top-tracks-in-brazil/:trackId',
  Validations.validateTrackId,
  (req, res) => playbackController.findTopTracksInBrazil(req, res)
);

router.get(
  '/search/:trackId',
  Validations.validateTrackId,
  Validations.validateSearchQuery,
  (req, res) => playbackController.findTrackBySearch(req, res)
);

router.get(
  '/:trackId',
  Validations.validateTrackId,
  (req, res) => playbackController.findPlaybackState(req, res)
);

router.get(
  '/queue/:trackId',
  Validations.validateTrackId,
  (req, res) => playbackController.findQueue(req, res)
);

router.get(
  '/spotify-queue/:trackId',
  Validations.validateTrackId,
  (req, res) => playbackController.findSpotifyQueue(req, res)
);

router.get(
  '/added-musics-by-dj/:djId/:trackId',
  Validations.validateDJId,
  Validations.validateTrackId,
  (req, res) => playbackController.findAddedMusicsByDJ(req, res)
)

router.get(
  '/dj-added-current-song/:trackId',
  Validations.validateTrackId,
  (req, res) => playbackController.findDJAddedCurrentMusic(req, res)
);

router.post(
  '/add-to-queue/:trackId',
  Validations.validateTrackId,
  Validations.validateToken,
  Validations.validateCreateMusic,
  (req, res) => playbackController.addTrackToQueue(req, res)
);

export default router;