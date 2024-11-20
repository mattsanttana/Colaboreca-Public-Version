import { Router } from 'express';
import trackRouter from './track.routes';
import djRouter from './dj.routes';
import playbackRouter from './playback.routes';
import voteRouter from './vote.routes';
import chatRouter from './chat.routes';
import { limiter } from '../utils/limiter';

const router = Router();

router.use('/tracks', limiter, trackRouter);
router.use('/djs', djRouter);
router.use('/playback', limiter, playbackRouter);
router.use('/votes', limiter, voteRouter);
router.use('/chats', chatRouter);

export default router;