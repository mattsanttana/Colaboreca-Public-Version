import { Router } from 'express';
import PlaybackController from '../controllers/PlaybackController';

const playbackController = new PlaybackController();

const router = Router();

router.get('/:trackId', (req, res) => playbackController.findPlaybackState(req, res));

export default router;
