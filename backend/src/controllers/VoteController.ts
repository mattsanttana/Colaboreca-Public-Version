import { Request, Response } from 'express';
import VoteService from '../services/VoteService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

export default class VoteController {
  constructor(private voteService: VoteService = new VoteService()) { }

  async verifyIfDJHasAlreadVoted(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.voteService.verifyIfDJHasAlreadVoted(authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}