import { Request, Response } from 'express';
import VoteService from '../services/VoteService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

// Classe responsável por controlar as requisições feitas para o voto
export default class VoteController {
  constructor(private voteService: VoteService = new VoteService()) { } // Injeta o serviço de voto

  // Método para criar um voto
  async createVote(req: Request, res: Response) {
    const { musicURI, vote } = req.body; // Pega a URI da música e o voto
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.voteService.createVote(authorization as string, musicURI, vote); // Chama o serviço de voto para criar um voto
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para verificar se o DJ já votou numa música específica
  async verifyIfDJHasAlreadVoted(req: Request, res: Response) {
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.voteService.verifyIfDJHasAlreadVoted(authorization as string); // Chama o serviço de voto para verificar se o DJ já votou
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar todos os votos de um DJ
  async getAllVotesForThisMusic(req: Request, res: Response) {
    const { trackId, musicURI } = req.params; // Pega o ID da pista e a URI da música
    const response = await this.voteService.getAllVotesForThisMusic(Number(trackId), musicURI); // Chama o serviço de voto para buscar todos os votos
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }
}