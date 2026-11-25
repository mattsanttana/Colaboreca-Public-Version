import { Router } from 'express';
import ModerationController from '../controllers/ModerationController';
import Validations from '../middlewares/Validations';

const moderationController = new ModerationController();
const router = Router();

router.patch(
  '/djs/:djId/moderator',
  Validations.validateDJId,
  Validations.validateToken,
  Validations.validateModeratorChange,
  (req, res) => moderationController.setModerator(req, res)
);

router.post(
  '/djs/:djId/timeout',
  Validations.validateDJId,
  Validations.validateToken,
  Validations.validateDJTimeout,
  (req, res) => moderationController.timeoutDJ(req, res)
);

router.delete(
  '/djs/:djId/timeout',
  Validations.validateDJId,
  Validations.validateToken,
  Validations.validateDJTimeoutRemoval,
  (req, res) => moderationController.removeTimeoutDJ(req, res)
);

router.delete(
  '/messages/:messageId',
  Validations.validateMessageId,
  Validations.validateToken,
  (req, res) => moderationController.deleteMessage(req, res)
);

export default router;
