import { Router } from 'express';
import VoteController from '../controllers/VoteController';
import Validations from '../middlewares/Validations';

const voteController = new VoteController();
const router = Router();

router.get(
  '/',
  Validations.validateToken,
  (req, res) => voteController.verifyIfDJHasAlreadVoted(req, res)
);

export default router;