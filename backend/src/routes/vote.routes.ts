import { Router } from 'express';
import VoteController from '../controllers/VoteController';
import Validations from '../middlewares/Validations';

// Classe responsável por controlar as rotas dos votos

const voteController = new VoteController(); // Instancia o controlador de votos
const router = Router(); // Instancia o roteador

router.post(
  '/', // Rota para criar um voto
  Validations.validateToken, // Valida o token
  Validations.validateCreateVote, // Valida se os dados do voto estão corretos
  (req, res) => voteController.createVote(req, res) // Chama o método para criar um voto
);

router.get(
  '/', // Rota para verificar se o DJ já votou numa música específica
  Validations.validateToken, // Valida o token
  (req, res) => voteController.verifyIfDJHasAlreadVoted(req, res) // Chama o método para verificar se o DJ já votou
);

router.get(
  '/get-all-votes-for-this-music/:trackId/:musicURI', // Rota para pegar todos os votos para uma música
  Validations.validateTrackId, // Valida o ID da música
  Validations.validateMusicURI, // Valida a URI da música
  (req, res) => voteController.getAllVotesForThisMusic(req, res) // Chama o método para pegar todos os votos para uma música
);

export default router;