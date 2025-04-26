import { Router } from 'express';
import DJController from '../controllers/DJController';
import Validations from '../middlewares/Validations';

// Esse arquivo define as rotas para as operações relacionadas a DJs na aplicação

const djController = new DJController(); // Instancia o controlador do DJ
const router = Router(); // Instancia o roteador

router.post(
  '/', // Rota para criar um DJ
  Validations.validateCreateDJ, // Valida se o DJ é válido
  (req, res) => djController.createDJ(req, res) // Chama o método para criar um DJ
);

router.patch(
  '/', // Rota para atualizar o DJ
  Validations.validateUpdateDJ, // Valida se o DJ é válido
  Validations.validateToken, // Valida o token
  (req, res) => djController.updateDJ(req, res) // Chama o método para atualizar o DJ
);

router.delete(
  '/', // Rota para deletar o DJ
  Validations.validateToken, // Valida o token
  (req, res) => djController.deleteDJ(req, res) // Chama o método para deletar o DJ
);

router.get(
  '/', // Rota para buscar o DJ logado e todos os DJs da pista dele
  Validations.validateToken, // Valida o token
  (req, res) => djController.findDJData(req, res) // Chama o método para buscar os dados do DJ
);

router.get(
  '/verify-if-the-dj-is-the-profile-owner/:id', // Rota para verificar se o DJ é o proprietário do perfil que ele tá visualizando
  Validations.validateId, // Valida o ID do DJ
  Validations.validateToken, // Valida o token
  (req, res) => djController.verifyIfTheDJIsTheProfileOwner(req, res) // Chama o método para verificar se o DJ é o proprietário do perfil
);

router.get(
  '/:trackId', // Rota para buscar todos os DJs de uma pista
  Validations.validateTrackId, // Valida o ID da pista
  (req, res) => djController.findAllDJsForTrack(req, res) // Chama o método para buscar todos os DJs
);

router.get(
  '/:djId/:trackId', // Rota para buscar um DJ por ID
  Validations.validateDJId, // Valida o ID do DJ
  Validations.validateTrackId, // Valida o ID da pista
  (req, res) => djController.findDJById(req, res) // Chama o método para buscar um DJ por ID
);

export default router;