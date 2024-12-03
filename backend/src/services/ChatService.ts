import { Op } from 'sequelize';
import ChatModel from '../models/ChatModel';
import MessageModel from '../models/MessageModel';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';
import TrackModel from '../models/TrackModel';

export default class ChatService {
  constructor(
    private chatModel: ChatModel = new ChatModel(),
    private messageModel: MessageModel = new MessageModel(),
    private trackModel: TrackModel = new TrackModel()
  ) { }

  async sendMessage(data: { djId: number; message: string; }, authorization: string) {
    const { djId, message } = data;
    const now = new Date();

    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const trackId = decoded.trackId;

      const io = getSocket(); // Obtenha a instância do Socket.IO

      // se a mensagem não tiver destinatário, então é uma mensagem para todos
      if (!djId) {
        const newMessage = await this.messageModel.create({
          chatId: null,
          trackId,
          djId: decoded.id,
          receiveDJId: null,
          message,
          createdAt: new Date()
        });

        if (!newMessage) {
          return { status: 'ERROR', data: { message: 'An error occurred' } };
        }

        // Emitir evento do Socket.IO para mensagem geral
        io.to(`general_${trackId}`).emit('chat message', newMessage);

        return { status: 'CREATED', data: newMessage };

        
      }

      // Verifica se já existe um chat entre os dois DJs
      const existingChat = await this.messageModel.findOne({
        where: {
          [Op.or]: [
            { djId: djId, receiveDJId: decoded.id },
            { djId: decoded.id, receiveDJId: djId }
          ]
        }
      });

      if (!existingChat) {
        const newChat = await this.chatModel.create(trackId);

        if (!newChat) {
          return { status: 'ERROR', data: { message: 'An error occurred' } };
        }

        const newMessage = await this.messageModel.create({
          chatId: newChat.id as number,
          trackId,
          djId: decoded.id,
          receiveDJId: djId,
          message,
          createdAt: new Date()
        });

        if (!newMessage) {
          return { status: 'ERROR', data: { message: 'An error occurred' } };
        }

        // Emitir evento do Socket.IO para mensagem direta
        io.to(`user_${djId}`).emit('chat message', newMessage);
        io.to(`user_${decoded.id}`).emit('chat message', newMessage);
        await this.trackModel.update({ updatedAt: now }, { id: trackId });

        return { status: 'CREATED', data: newMessage };  
      }

      // Cria a mensagem e associa ao chat existente ou recém-criado
      const newMessage = await this.messageModel.create({
        chatId: existingChat.chatId as number,
        trackId,
        djId: decoded.id,
        receiveDJId: djId,
        message,
        createdAt: new Date()
      });

      if (!newMessage) {
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      // Emitir evento do Socket.IO para mensagem direta
      io.to(`user_${djId}`).emit('chat message', newMessage);
      io.to(`user_${decoded.id}`).emit('chat message', newMessage);
      await this.trackModel.update({ updatedAt: now }, { id: trackId });

      return { status: 'CREATED', data: newMessage };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findAllMessagesForThisDJ(authorization: string) {
    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const trackId = decoded.trackId;

      const messages = await this.messageModel.findAll({
        where: {
          trackId, // Filtrar mensagens pelo trackId
          [Op.or]: [
            { djId: decoded.id },
            { receiveDJId: decoded.id },
            { chatId: null } // Incluir mensagens gerais
          ]
        },
        order: [['createdAt', 'ASC']]
      });

      return { status: 'OK', data: messages };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }
}