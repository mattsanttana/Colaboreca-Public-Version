import { Request, Response } from 'express';
import VoteService from '../services/VoteService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

export default class VoteController {
  constructor(private voteService: VoteService = new VoteService()) { }

  async createVote(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const { musicURI, vote } = req.body;
    const response = await this.voteService.createVote(authorization as string, musicURI, vote);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async verifyIfDJHasAlreadVoted(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.voteService.verifyIfDJHasAlreadVoted(authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async getAllVotesForThisMusic(req: Request, res: Response) {
    const { trackId, musicURI } = req.params;
    const response = await this.voteService.getAllVotesForThisMusic(trackId, musicURI);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}