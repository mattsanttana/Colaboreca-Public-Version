import { Router } from 'express';
import TrackController from '../controllers/TrackController';
import Validations from '../middlewares/Validations';

const trackController = new TrackController();
const router = Router();

// Rotas de Criação, Atualização e Exclusão
router.post(
  '/',
  Validations.validateCreateTrack,
  (req, res) => trackController.createTrack(req, res)
);

router.put(
  '/',
  Validations.validateTrackName,
  Validations.validateToken,
  (req, res) => trackController.updateTrack(req, res)
);

router.delete(
  '/',
  Validations.validateToken,
  (req, res) => trackController.deleteTrack(req, res)
);

// Rotas de Verificação e Login
router.get(
  '/login',
  (req, res) => trackController.loginWithSpotify(req, res)
);

router.get(
  '/verify-if-track-already-been-created/',
  Validations.validateToken,
  (req, res) => trackController.verifyIfTrackAlreadyBeenCreated(req, res)
);

router.get(
  '/verify-track-access/:id',
  Validations.validateId,
  Validations.validateToken,
  (req, res) => trackController.verifyTrackAccess(req, res)
);

router.get(
  '/enter-track/:id',
  (req, res) => trackController.enterTrack(req, res)
);

// Rotas Específicas por ID
router.delete(
  '/:id',
  Validations.validateId,
  Validations.validateToken,
  (req, res) => trackController.deleteDJ(req, res) // Mantido deleteDJ
);

router.get(
  '/:id',
  Validations.validateId,
  (req, res) => trackController.findTrackById(req, res)
);

export default router;