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
  '/:trackId',
  Validations.validateTrackId,
  (req, res) => playbackController.findPlaybackState(req, res)
);
export default router;
