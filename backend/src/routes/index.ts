import { Router } from 'express';
import trackRouter from './track.routes';
import djRouter from './dj.routes';
import playbackRouter from './playback.routes';

const router = Router();

router.use('/tracks', trackRouter);
router.use('/djs', djRouter);
router.use('/playback', playbackRouter);

export default router;