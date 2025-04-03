import { Router } from 'express';
import trackRouter from './track.routes';
import djRouter from './dj.routes';
import playbackRouter from './playback.routes';
import voteRouter from './vote.routes';
import chatRouter from './chat.routes';
import { limiter } from '../utils/limiter';

// Classe responsável por controlar as rotas

const router = Router(); // Instancia o roteador

router.use('/tracks', limiter, trackRouter); // Adiciona as rotas de música
router.use('/djs', djRouter); // Adiciona as rotas de DJ
router.use('/playback', limiter, playbackRouter); // Adiciona as rotas de reprodução
router.use('/votes', limiter, voteRouter); // Adiciona as rotas de voto
router.use('/chats', chatRouter); // Adiciona as rotas de chat

export default router;