import { Router } from 'express';
import PlaybackController from '../controllers/PlaybackController';
import Validations from '../middlewares/Validations';

// Esse arquivo define as rotas para as operações relacionadas à reprodução de músicas na aplicação

const playbackController = new PlaybackController(); // Instancia o controlador de reprodução
const router = Router(); // Instancia o roteador

router.post(
  '/add-to-queue/:trackId', // Rota para adicionar uma música à fila
  Validations.validateCreateMusic, // Valida a música
  Validations.validateTrackId, // Valida o ID da pista
  Validations.validateToken, // Valida o token
  (req, res) => playbackController.addTrackToQueue(req, res) // Chama o método para adicionar uma música à fila
);

router.get(
  '/top-tracks-in-brazil/:trackId', // Rota para buscar as músicas mais tocadas no Brasil
  Validations.validateTrackId, // Valida o ID da pista
  (req, res) => playbackController.findTopTracksInBrazil(req, res) // Chama o método para buscar as músicas mais tocadas no Brasil
);

router.get(
  '/search/:trackId', // Rota para buscar músicas por pesquisa
  Validations.validateTrackId, // Valida o ID da pista
  Validations.validateSearchQuery, // Valida a pesquisa
  (req, res) => playbackController.findTrackBySearch(req, res) // Chama o método para buscar músicas por pesquisa
);

router.get(
  '/:trackId', // Rota para buscar o estado de reprodução
  Validations.validateTrackId, // Valida o ID da pista
  (req, res) => playbackController.findPlaybackState(req, res) // Chama o método para buscar o estado de reprodução
);

router.get(
  '/queue/:trackId', // Rota para buscar a fila de reprodução
  Validations.validateTrackId, // Valida o ID da pista
  (req, res) => playbackController.findQueue(req, res) // Chama o método para buscar a fila de reprodução
);

router.get(
  '/added-musics-by-dj/:djId/:trackId', // Rota para buscar as músicas adicionadas pelo DJ
  Validations.validateDJId, // Valida o ID do DJ
  Validations.validateTrackId, // Valida o ID da pista
  (req, res) => playbackController.findAddedMusicsByDJ(req, res) // Chama o método para buscar as músicas adicionadas pelo DJ
)

router.get(
  '/dj-added-current-music/:trackId', // Rota para buscar o DJ que adicionou a música que está sendo reproduzida no momento
  Validations.validateTrackId, // Valida o ID da pista
  (req, res) => playbackController.findDJAddedCurrentMusic(req, res) // Chama o método para buscar o DJ que adicionou a música que está sendo reproduzida no momento
);

export default router;