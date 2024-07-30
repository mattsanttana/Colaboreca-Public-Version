import { Router } from 'express';
import TrackController from '../controllers/TrackController';

const trackController = new TrackController();

const router = Router();

router.post('/', (req, res) => trackController.createTrack(req, res));
router.delete('/', (req, res) => trackController.deleteTrack(req, res));
router.get('/login', (req, res) => trackController.loginWithSpotify(req, res));
router.get('/verify-if-track-already-been-created/', (req, res) => trackController.verifyIfTrackAlreadyBeenCreated(req, res));
router.get('/enter-track/:id', (req, res) => trackController.enterTrack(req, res));
router.delete('/:id', (req, res) => trackController.deleteDJ(req, res)); // Verifique se isso está correto
router.get('/:id', (req, res) => trackController.findTrackById(req, res));

export default router;