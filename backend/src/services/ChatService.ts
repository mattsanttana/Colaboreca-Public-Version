import { Op, Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import { IMessage } from '../interfaces/messages/IMessage';
import ChatModel from '../models/ChatModel';
import MessageModel from '../models/MessageModel';
import TrackModel from '../models/TrackModel';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';

// essa é classe que contém toda a lógica de negócio para o chat
export default class ChatService {
  constructor(
    // Injetar as dependências necessárias
    private sequelize: Sequelize = new Sequelize(config),
    private chatModel: ChatModel = new ChatModel(),
    private messageModel: MessageModel = new MessageModel(),
  ) { }

  // Método para enviar mensagens
  async sendMessage(data: { djId: number; message: string; messageToReply: IMessage | null }, authorization: string) {
    const transaction = await this.sequelize.transaction(); // Iniciar uma transação
    const io = getSocket(); // Obtenha a instância do Socket.IO
    const { djId, message } = data; // Receber os dados da mensagem

    try {
      // Verificar se o token é válido
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      // Se o token for inválido, retornar uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const trackId = decoded.trackId; // Pegar o ID da pista
      let chatId: number | null = null; // Inicializar o ID do chat como nulo

      // Verificar se o chat já existe
      if (djId) {
        // Se o DJ ID for fornecido, verifique se o chat já existe
        const existingChat = await this.messageModel.findOne({
          where: {
            [Op.or]: [
              { djId: djId, receiveDJId: decoded.id },
              { djId: decoded.id, receiveDJId: djId }
            ]
          }
        }, { transaction });

        // Se o chat não existir, crie um novo
        if (!existingChat) {
          const newChat = await this.chatModel.create(trackId, { transaction });

          // Se o chat não for criado, retorne uma mensagem de erro
          if (!newChat) {
            await transaction.rollback();
            return { status: 'ERROR', data: { message: 'An error occurred' } };
          }

          chatId = newChat.id ?? null; // Pegar o ID do chat recém-criado ou null se undefined
        } else {
          chatId = existingChat.chatId ?? null; // Se o chat existir, pegue o ID do chat existente ou null se undefined
        }
      }

      // Cria a mensagem e associa ao chatId
      const newMessage = await this.messageModel.create({
        chatId,
        trackId,
        djId: decoded.id,
        receiveDJId: djId || null,
        message,
        createdAt: new Date(),
        isReply: data.messageToReply ? true : false,
        replyTo: data.messageToReply?.id ?? null
      }, { transaction });

      // Se a mensagem não for criada, retorne uma mensagem de erro
      if (!newMessage) {
        await transaction.rollback();
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      // Emitir um evento para todos os clientes conectados de que uma nova mensagem foi enviada
      if (djId) {
        io.to(`user_${djId}`).emit('chat message', newMessage);
        io.to(`user_${decoded.id}`).emit('chat message', newMessage);
      } else {
        io.to(`general_${trackId}`).emit('chat message', newMessage); // Emitir um evento para o chat geral de que uma nova mensagem foi enviada
      }

      await transaction.commit(); // Commitar a transação 

      return { status: 'CREATED', data: newMessage }; // Retornar a mensagem criada com o status correspondente     
    } catch (error) {
      // Se ocorrer um erro, rollback a transação, exiba no console e retorne uma mensagem de erro
      await transaction.rollback();
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para buscar todas as mensagens para um DJ específico
  async findAllMessagesForThisDJ(authorization: string) {
    try {
      // Verificar se o token é válido
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const trackId = decoded.trackId; // Pegar o ID da pista

      // Buscar todas as mensagens para o DJ em questão
      const messages = await this.messageModel.findAll({
        where: {
          trackId, // Filtrar mensagens pelo trackId
          [Op.or]: [
            { djId: decoded.id },
            { receiveDJId: decoded.id },
            { chatId: null } // Incluir mensagens gerais
          ]
        },
        order: [['createdAt', 'ASC']] // Ordenar as mensagens por data de criação
      });

      return { status: 'OK', data: messages }; // Retornar as mensagens com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para marcar mensagens como lidas
  async markMessagesAsRead(data: { messageIds: (string | number)[]; }, authorization: string) {
    const transaction = await this.sequelize.transaction(); // Iniciar uma transação
    const io = getSocket(); // Obter a instância do Socket.IO
    const { messageIds } = data; // Receber os IDs das mensagens

    try {
      // Verificar se o token é válido
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const updated = await this.messageModel.update(messageIds, { transaction }); // Marcar mensagens como lidas

      // Se as mensagens não forem marcadas como lidas, rollback a transação e retorne uma mensagem de erro
      if (!updated) {
        await transaction.rollback();
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }


      const messages = await this.messageModel.findAll({ where: { id: messageIds } }); // Buscar as mensagens pelo ID
      const senderDJId = messages[0].djId === decoded.id ? messages[0].receiveDJId : messages[0].djId; // Pegar o ID do DJ que enviou a mensagem

      io.to(`user_${senderDJId}`).emit('messages marked as read', { messageIds }); // Emitir um evento para o Socket.IO de que as mensagens foram marcadas como lidas para o DJ que enviou as mensagens

      await transaction.commit(); // Commitar a transação

      return { status: 'OK', data: { message: 'Messages marked as read' } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, rollback a trasaction e retorne uma mensagem de erro
      await transaction.rollback();
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }
}