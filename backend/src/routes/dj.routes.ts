import { Router } from 'express';
import DJController from '../controllers/DJController';
import Validations from '../middlewares/Validations';

const djController = new DJController();
const router = Router();

router.post(
  '/',
  Validations.validateCreateDJ,
  (req, res) => djController.createDJ(req, res)
);

router.put(
  '/',
  Validations.validateUpdateDJ,
  Validations.validateToken,
  (req, res) => djController.updateDJ(req, res)
);

router.delete(
  '/',
  Validations.validateToken,
  (req, res) => djController.deleteDJ(req, res)
);

router.get(
  '/',
  Validations.validateToken,
  (req, res) => djController.findDJData(req, res)
);

router.get(
  '/verify-if-the-dj-is-the-profile-owner/:id',
  Validations.validateId,
  Validations.validateToken,
  (req, res) => djController.verifyIfTheDJIsTheProfileOwner(req, res)
);

router.get(
  '/:trackId',
  Validations.validateTrackId,
  (req, res) => djController.findAllDJsForTrack(req, res)
);

router.get(
  '/:djId/:trackId',
  Validations.validateDJId,
  Validations.validateTrackId,
  (req, res) => djController.findDJById(req, res)
);

export default router;