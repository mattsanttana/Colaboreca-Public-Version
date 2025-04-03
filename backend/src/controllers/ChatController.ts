import { Request, Response } from 'express';
import ChatService from '../services/ChatService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

// Classe responsável por controlar as requisições feitas para o chat
export default class ChatController {
  constructor(private chatService: ChatService = new ChatService()) { } // Injeta o serviço de chat

  // Método para enviar uma mensagem
  async sendMessage(req: Request, res: Response) {
    const data = req.body; // Pega os dados da requisição
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.chatService.sendMessage(data, authorization as string); // Chama o serviço de chat para enviar a mensagem
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar todas as mensagens de um chat
  async findAllMessagesForThisDJ(req: Request, res: Response) {
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.chatService.findAllMessagesForThisDJ(authorization as string); // Chama o serviço de chat para buscar todas as mensagens
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para marcar a mensagem como lida
  async markMessagesAsRead(req: Request, res: Response) {
    const data = req.body; // Pega os dados da requisição
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.chatService.markMessagesAsRead(data, authorization as string); // Chama o serviço de chat para marcar a mensagem como lida
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }
}