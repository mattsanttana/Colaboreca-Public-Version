import { Request, Response } from 'express';
import DJService from '../services/DJService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

// Classe responsável por controlar as requisições feitas para o DJ
export default class DJController {
  constructor(private djService: DJService = new DJService()) { } // Injeta o serviço de DJ

  // Método para criar um DJ
  async createDJ(req: Request, res: Response) {
    const data = req.body; // Pega os dados da requisição
    const response = await this.djService.createDJ(data); // Chama o serviço de DJ para criar um DJ
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar todos os DJs de uma pista
  async findAllDJsForTrack(req: Request, res: Response) {
    const { trackId } = req.params; // Pega o ID da pista
    const response = await this.djService.findAllDJsForTrack(Number(trackId)); // Chama o serviço de DJ para buscar todos os DJs
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar um DJ por ID
  async findDJById(req: Request, res: Response) {
    const { djId, trackId } = req.params; // Pega o ID do DJ e o ID da pista
    const response = await this.djService.findDJById(Number(djId), Number(trackId)); // Chama o serviço de DJ para buscar um DJ por ID
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscaro DJ logado e todos os DJs da pista dele, a resposta é tipo { dj: DJ, allDJs: DJ[] }
  async findDJData(req: Request, res: Response) {
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.djService.findDJData(authorization as string); // Chama o serviço de DJ para buscar os dados do DJ
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para verificar se o DJ é o proprietário do perfil que ele tá visualizando
  async verifyIfTheDJIsTheProfileOwner(req: Request, res: Response) {
    const { id } = req.params; // Pega o ID do DJ
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.djService.verifyIfTheDJIsTheProfileOwner(Number(id), authorization as string); // Chama o serviço de DJ para verificar se o DJ é o proprietário do perfil
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para atualizar o DJ
  async updateDJ(req: Request, res: Response) {
    const { characterPath, djName } = req.body; // pega o caminho do personagem e o nome do DJ
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.djService.updateDJ(characterPath, djName, authorization as string); // Chama o serviço de DJ para atualizar o DJ
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para deletar o DJ
  async deleteDJ(req: Request, res: Response) {
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.djService.deleteDJ(authorization as string); // Chama o serviço de DJ para deletar o DJ
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }
}