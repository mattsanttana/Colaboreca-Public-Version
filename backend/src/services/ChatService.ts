import { Op, Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import { IMessage } from '../interfaces/messages/IMessage';
import ChatModel from '../models/ChatModel';
import MessageModel from '../models/MessageModel';
import TrackModel from '../models/TrackModel';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';
import SequelizeMessage from '../database/models/SequelizeMessage';
import SequelizeMessageReaction from '../database/models/SequelizeMessageReaction';
import SequelizeDJ from '../database/models/SequelizeDJ';
import SequelizeTrack from '../database/models/SequelizeTrack';

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
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const trackId = decoded.trackId; // Pegar o ID da pista
      const sender = await SequelizeDJ.findOne({
        where: { id: decoded.id, trackId },
      });
      if (!sender) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'DJ not found' } };
      }
      if (sender.chatTimeoutUntil && sender.chatTimeoutUntil.getTime() > Date.now()) {
        await transaction.rollback();
        return {
          status: 'FORBIDDEN',
          data: {
            message: 'You are timed out from sending chat messages',
            timeoutUntil: sender.chatTimeoutUntil,
          },
        };
      }

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

  async toggleMessageReaction(data: { messageId: number; emoji: string }, authorization: string) {
    const token = authorization.split(' ')[1];
    const decoded = JWT.verify(token);

    if (typeof decoded === 'string') {
      return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
    }

    const transaction = await this.sequelize.transaction();

    try {
      const message = await SequelizeMessage.findOne({
        where: { id: data.messageId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!message || message.trackId !== decoded.trackId) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Message not found' } };
      }
      if (message.deletedAt) {
        await transaction.rollback();
        return { status: 'FORBIDDEN', data: { message: 'Deleted messages cannot receive reactions' } };
      }

      if (
        message.chatId !== null
        && message.djId !== decoded.id
        && message.receiveDJId !== decoded.id
      ) {
        await transaction.rollback();
        return { status: 'FORBIDDEN', data: { message: 'Not allowed to react to this message' } };
      }

      const existingReaction = await SequelizeMessageReaction.findOne({
        where: {
          messageId: data.messageId,
          djId: decoded.id,
          emoji: data.emoji,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const active = !existingReaction;
      const createdAt = new Date();

      if (existingReaction) {
        await existingReaction.destroy({ transaction });
      } else {
        await SequelizeMessageReaction.create(
          {
            messageId: data.messageId,
            djId: decoded.id,
            emoji: data.emoji,
            createdAt,
            read: false,
          },
          { transaction }
        );
      }

      await transaction.commit();

      const reactionEvent = {
        messageId: data.messageId,
        emoji: data.emoji,
        djId: decoded.id,
        active,
        createdAt: active ? createdAt : null,
      };
      const io = getSocket();

      if (message.chatId === null) {
        io.to(`general_${message.trackId}`).emit(
          'message reaction updated',
          reactionEvent
        );
      } else if (message.receiveDJId) {
        io.to(`user_${message.djId}`)
          .to(`user_${message.receiveDJId}`)
          .emit('message reaction updated', reactionEvent);
      }

      return { status: 'OK', data: reactionEvent };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return {
        status: 'ERROR',
        data: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      };
    }
  }

  async editMessage(messageId: number, content: string, authorization: string) {
    const token = authorization.split(' ')[1];
    const decoded = JWT.verify(token);

    if (typeof decoded === 'string') {
      return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
    }

    const transaction = await this.sequelize.transaction();
    let transactionCommitted = false;

    try {
      const message = await SequelizeMessage.findOne({
        where: { id: messageId, trackId: decoded.trackId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!message) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Message not found' } };
      }
      if (message.djId !== decoded.id) {
        await transaction.rollback();
        return { status: 'FORBIDDEN', data: { message: 'Only the sender can edit this message' } };
      }
      if (message.deletedAt) {
        await transaction.rollback();
        return { status: 'FORBIDDEN', data: { message: 'Deleted messages cannot be edited' } };
      }
      if (message.message === content) {
        await transaction.rollback();
        return {
          status: 'OK',
          data: {
            messageId,
            message: message.message,
            previousMessage: message.previousMessage,
            editedAt: message.editedAt,
          },
        };
      }

      const previousMessage = message.message;
      const editedAt = new Date();
      await message.update(
        { message: content, previousMessage, editedAt },
        { transaction }
      );
      await transaction.commit();
      transactionCommitted = true;

      const update = { messageId, message: content, previousMessage, editedAt };
      const io = getSocket();
      if (message.chatId === null) {
        io.to(`general_${message.trackId}`).emit('chat message edited', update);
      } else if (message.receiveDJId) {
        io.to(`user_${message.djId}`)
          .to(`user_${message.receiveDJId}`)
          .emit('chat message edited', update);
      }

      return { status: 'OK', data: update };
    } catch (error) {
      if (!transactionCommitted) await transaction.rollback();
      console.error(error);
      return {
        status: 'ERROR',
        data: { message: error instanceof Error ? error.message : 'An unknown error occurred' },
      };
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
      const [requester, track] = await Promise.all([
        SequelizeDJ.findOne({ where: { id: decoded.id, trackId } }),
        SequelizeTrack.findByPk(trackId),
      ]);
      if (!requester || !track) {
        return { status: 'UNAUTHORIZED', data: { message: 'DJ or track not found' } };
      }
      const canReadDeletedContent = requester.isModerator || track.ownerDjId === requester.id;

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
      }, undefined, true);

      const visibleMessages = messages.map((message) => {
        if (!message.deletedAt || canReadDeletedContent) return message;
        return {
          ...message,
          message: message.deletedByModeration
            ? 'Essa mensagem foi apagada pela moderação'
            : 'Essa mensagem foi apagada pelo DJ',
          previousMessage: null,
          reactions: [],
        };
      });

      return { status: 'OK', data: visibleMessages }; // Retornar as mensagens com o status correspondente
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
  async markMessagesAsRead(
    data: { messageIds: (string | number)[] },
    authorization: string
  ) {
    const transaction = await this.sequelize.transaction();
    const { messageIds } = data;
    let transactionCommitted = false;

    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);
      if (typeof decoded === 'string') {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const candidateMessages = await SequelizeMessage.findAll({
        where: {
          id: { [Op.in]: messageIds },
          trackId: decoded.trackId,
          read: false,
          djId: { [Op.ne]: decoded.id },
        },
        transaction,
      });

      const privateMessages = candidateMessages.filter(
        (message) =>
          message.chatId !== null && message.receiveDJId === decoded.id
      );
      const generalReplies = candidateMessages.filter(
        (message) =>
          message.chatId === null
          && message.isReply
          && typeof message.replyTo === 'number'
      );
      const repliedToMessages = generalReplies.length
        ? await SequelizeMessage.findAll({
            where: {
              id: { [Op.in]: generalReplies.map((message) => message.replyTo!) },
              trackId: decoded.trackId,
              chatId: null,
              djId: decoded.id,
            },
            transaction,
          })
        : [];
      const ownedReplyIds = new Set(repliedToMessages.map((message) => message.id));
      const validGeneralReplies = generalReplies.filter(
        (message) => message.replyTo !== null && ownedReplyIds.has(message.replyTo)
      );
      const messagesToMark = [...privateMessages, ...validGeneralReplies];
      const validMessageIds = messagesToMark.flatMap((message) =>
        message.id === undefined ? [] : [message.id]
      );

      if (validMessageIds.length > 0) {
        await SequelizeMessage.update(
          { read: true },
          {
            where: { id: { [Op.in]: validMessageIds }, trackId: decoded.trackId },
            transaction,
          }
        );
      }

      await transaction.commit();
      transactionCommitted = true;

      const io = getSocket();
      const senderDJIds = new Set(messagesToMark.map((message) => message.djId));
      io.to(`user_${decoded.id}`).emit('messages marked as read', {
        messageIds: validMessageIds,
      });
      senderDJIds.forEach((senderDJId) => {
        io.to(`user_${senderDJId}`).emit('messages marked as read', {
          messageIds: messagesToMark
            .filter((message) => message.djId === senderDJId)
            .flatMap((message) =>
              message.id === undefined ? [] : [message.id]
            ),
        });
      });

      return { status: 'OK', data: { message: 'Messages marked as read' } };
    } catch (error) {
      if (!transactionCommitted) await transaction.rollback();
      console.error(error);
      return {
        status: 'ERROR',
        data: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      };
    }
  }

  async markMessageReactionsAsRead(
    data: { messageIds: number[] },
    authorization: string
  ) {
    const token = authorization.split(' ')[1];
    const decoded = JWT.verify(token);

    if (typeof decoded === 'string') {
      return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
    }

    const transaction = await this.sequelize.transaction();
    let transactionCommitted = false;
    try {
      const ownMessages = await SequelizeMessage.findAll({
        where: {
          id: { [Op.in]: data.messageIds },
          trackId: decoded.trackId,
          djId: decoded.id,
          chatId: { [Op.ne]: null },
          deletedAt: null,
        },
        attributes: ['id'],
        transaction,
      });
      const messageIds = ownMessages.flatMap((message) =>
        message.id === undefined ? [] : [message.id]
      );

      if (messageIds.length > 0) {
        await SequelizeMessageReaction.update(
          { read: true },
          {
            where: {
              messageId: { [Op.in]: messageIds },
              djId: { [Op.ne]: decoded.id },
              read: false,
            },
            transaction,
          }
        );
      }

      await transaction.commit();
      transactionCommitted = true;
      getSocket()
        .to(`user_${decoded.id}`)
        .emit('message reactions marked as read', { messageIds });
      return { status: 'OK', data: { message: 'Reactions marked as read' } };
    } catch (error) {
      if (!transactionCommitted) await transaction.rollback();
      console.error(error);
      return {
        status: 'ERROR',
        data: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
        },
      };
    }
  }
}