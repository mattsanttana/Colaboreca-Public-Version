import { FindOptions, Transaction, WhereOptions } from "sequelize";
import SequelizeMessage from "../database/models/SequelizeMessage";
import SequelizeDJ from "../database/models/SequelizeDJ";
import { Op } from 'sequelize';

// Classe responsável pelo modelo de mensagem
export default class MessageModel {
  private messageModel = SequelizeMessage; // Instância do modelo de mensagem

  private readonly messageIncludes = [
    {
      model: SequelizeDJ,
      as: 'dj',
      attributes: ['id', 'djName', 'characterPath', 'score', 'ranking', 'trackId'],
    },
    {
      model: SequelizeDJ,
      as: 'receiveDJ',
      attributes: ['id', 'djName', 'characterPath', 'score', 'ranking', 'trackId'],
    },
  ];

  // Método para criar uma mensagem
  async create(
    data: {
      chatId: number | null,
      trackId: number,
      djId: number,
      receiveDJId: number | null,
      message: string,
      createdAt: Date,
      isReply?: boolean,
      replyTo?: number | null
    },
    options: { transaction: Transaction }
  ) {

    const { chatId, trackId, djId, receiveDJId, message, createdAt, isReply, replyTo } = data; // Destruturação dos dados

    // Cria uma mensagem
    const response = await this.messageModel.create({
      chatId,
      trackId,
      djId,
      receiveDJId,
      message,
      createdAt,
      isReply,
      replyTo
    }, options);

    const createdMessage = response.get();
    const hydratedMessage = await this.findOne({
      where: { id: createdMessage.id },
    }, options);

    return hydratedMessage ?? createdMessage; // Retorna a mensagem com os DJs relacionados
  }

  // Método para atualizar mensagens
  async update(messageIds: (number | string)[], options: { transaction: Transaction }) { 
    // Atualiza mensagens
    const response = await this.messageModel.update(
      {
        read: true,
      },
      {
        where: {
          id: {
            [Op.in]: messageIds,
          },
        },
        ...options,
      }
    );
    return response; // Retorna a resposta
  }

  // Método para buscar uma mensagem
  async findOne(findOptions: FindOptions, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e busca uma mensagem
    const response = await this.messageModel.findOne({
      ...findOptions,
      include: this.messageIncludes,
      ...options,
    });
    return response?.get(); // Retorna a mensagem encontrada
  }

  // Método para buscar todas as mensagens
  async findAll(findOptions: FindOptions, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e busca todas as mensagens
    const response = await this.messageModel.findAll({
      ...findOptions,
      include: this.messageIncludes,
      ...options,
    });
    return response.map((message) => message.get()); // Retorna as mensagens encontradas
  }

  // Método para buscar todas as mensagens
  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.messageModel.destroy({ where, ...options }); // Deleta uma mensagem
    return response; // Retorna a resposta
  }
}
