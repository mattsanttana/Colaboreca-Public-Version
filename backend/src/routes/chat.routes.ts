import { Router } from 'express';
import ChatController from '../controllers/ChatController';
import Validations from '../middlewares/Validations';

const chatController = new ChatController();
const router = Router();

router.post(
  '/',
  Validations.validateSendMessage,
  Validations.validateToken,
  (req, res) => chatController.sendMessage(req, res)
);

export default router;