import { Router } from 'express';
import ChatController from '../controllers/ChatController';
import Validations from '../middlewares/Validations';

// Esse arquivo define as rotas para as operações relacionadas ao chat na aplicação

const chatController = new ChatController(); // Instancia o controlador do chat
const router = Router(); // Instancia o roteador

router.post(
  '/', // Rota para enviar uma mensagem
  Validations.validateSendMessage, // Valida se a mensagem é válida
  Validations.validateToken, // Valida o token
  (req, res) => chatController.sendMessage(req, res) // Chama o método para enviar a mensagem
);

router.get(
  '/', // Rota para buscar todas as mensagens de um chat
  Validations.validateToken, // Valida o token
  (req, res) => chatController.findAllMessagesForThisDJ(req, res) // Chama o método para buscar todas as mensagens
);

router.patch(
  '/', // Rota para marcar a mensagem como lida
  Validations.validateMessagesIds, // Valida os IDs das mensagens
  Validations.validateToken, // Valida o token
  (req, res) => chatController.markMessagesAsRead(req, res) // Chama o método para marcar a mensagem como lida
);

export default router;