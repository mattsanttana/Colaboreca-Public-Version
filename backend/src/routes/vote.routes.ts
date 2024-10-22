import { Router } from 'express';
import VoteController from '../controllers/VoteController';
import Validations from '../middlewares/Validations';

const voteController = new VoteController();
const router = Router();

router.post(
  '/',
  Validations.validateToken,
  Validations.validateCreateVote,
  (req, res) => voteController.createVote(req, res)
);

router.get(
  '/',
  Validations.validateToken,
  (req, res) => voteController.verifyIfDJHasAlreadVoted(req, res)
);

router.get(
  '/get-all-votes-for-this-music/:trackId/:musicURI',
  Validations.validateTrackId,
  Validations.validateMusicURI,
  (req, res) => voteController.getAllVotesForThisMusic(req, res)
);

export default router;