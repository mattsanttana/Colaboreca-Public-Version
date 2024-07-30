import { Router } from 'express';
import DJController from '../controllers/DJController';

const djController = new DJController();

const router = Router();

router.post('/', (req, res) => djController.createDJ(req, res));
router.put('/', (req, res) => djController.updateDJ(req, res));
router.delete('/', (req, res) => djController.deleteDJ(req, res));
router.get('/', (req, res) => djController.findDJByToken(req, res));
router.get('/verify-if-dj-has-already-been-created-for-this-track', (req, res) => djController.verifyIfDjHasAlreadyBeenCreatedForThisTrack(req, res));
router.get('/verify-if-the-dj-is-the-profile-owner/:id', (req, res) => djController.verifyIfTheDJIsTheProfileOwner(req, res));
router.get('/:trackId', (req, res) => djController.findAllDJsForTrack(req, res));
router.get('/:djId/:trackId', (req, res) => djController.findDJById(req, res));

export default router;