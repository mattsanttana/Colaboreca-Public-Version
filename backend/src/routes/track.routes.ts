import { Router } from 'express';
import TrackController from '../controllers/TrackController';
import Validations from '../middlewares/Validations';

// Esse arquivo define as rotas para as operações relacionadas a pistas (tracks) na aplicação

const trackController = new TrackController(); // Instancia o controlador de pistas
const router = Router(); // Instancia o roteador

router.post(
  '/', // Rota para criar uma pista
  Validations.validateCreateTrack, // Valida se os dados da pista estão corretos
  (req, res) => trackController.createTrack(req, res) // Chama o método para criar uma pista
);

router.patch(
  '/', // Rota para atualizar uma pista
  Validations.validateTrackName, // Valida se o nome da pista está correto
  Validations.validateToken, // Valida o token
  (req, res) => trackController.updateTrack(req, res) // Chama o método para atualizar uma pista
);

router.delete(
  '/', // Rota para deletar uma pista
  Validations.validateToken, // Valida o token
  (req, res) => trackController.deleteTrack(req, res) // Chama o método para deletar uma pista
);

router.delete(
  '/:id', // Rota para deletar um DJ
  Validations.validateId, // Valida o ID
  Validations.validateToken, // Valida o token
  (req, res) => trackController.deleteDJ(req, res) // Chama o método para deletar um DJ
);

router.get(
  '/login', // Rota para fazer login com o Spotify
  (req, res) => trackController.loginWithSpotify(req, res) // Chama o método para fazer login com o Spotify
);

router.get(
  '/verify-if-track-already-been-created/', // Rota para verificar se a pista já foi criada para o dispositivo
  Validations.validateToken, // Valida o token
  (req, res) => trackController.verifyIfTrackAlreadyBeenCreated(req, res) // Chama o método para verificar se a pista já foi criada para o dispositivo
);

router.get(
  '/verify-track-access/:id', // Rota para verificar se o usuário tem acesso à pista
  Validations.validateId, // Valida o ID da pista
  Validations.validateToken, // Valida o token
  (req, res) => trackController.verifyTrackAccess(req, res) // Chama o método para verificar se o usuário tem acesso à pista
);

router.get(
  '/enter-track/:id', // Rota para entrar numa pista
  (req, res) => trackController.enterTrack(req, res) // Chama o método para entrar numa pista
);

router.get(
  '/:id', // Rota para encontrar uma pista pelo ID
  Validations.validateId, // Valida o ID
  (req, res) => trackController.findTrackById(req, res) // Chama o método para encontrar uma pista pelo ID
);

export default router;