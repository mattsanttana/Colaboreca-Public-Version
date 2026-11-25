import { Router } from 'express';
import trackRouter from './track.routes';
import djRouter from './dj.routes';
import playbackRouter from './playback.routes';
import voteRouter from './vote.routes';
import chatRouter from './chat.routes';
import moderationRouter from './moderation.routes';
import { limiter } from '../utils/limiter';

// Classe responsável por controlar as rotas

const router = Router(); // Instancia o roteador

router.use('/tracks', trackRouter); // Adiciona as rotas de música
router.use('/djs', djRouter); // Adiciona as rotas de DJ
router.use('/playback', playbackRouter); // Adiciona as rotas de reprodução
router.use('/votes', voteRouter); // Adiciona as rotas de voto
router.use('/chats', chatRouter); // Adiciona as rotas de chat
router.use('/moderation', moderationRouter);

export default router;