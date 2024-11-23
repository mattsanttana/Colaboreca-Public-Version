import { Request, Response } from 'express';
import ChatService from '../services/ChatService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

export default class ChatController {
  constructor(private chatService: ChatService = new ChatService()) { }

  async sendMessage(req: Request, res: Response) {
    const data = req.body;
    const authorization = req.headers.authorization;
    const response = await this.chatService.sendMessage(data, authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findAllMessagesForThisDJ(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.chatService.findAllMessagesForThisDJ(authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}