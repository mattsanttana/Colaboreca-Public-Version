import { FindOptions, Transaction, WhereOptions } from "sequelize";
import SequelizeMessage from "../database/models/SequelizeMessage";
import { Op } from 'sequelize';

export default class MessageModel {
  private messageModel = SequelizeMessage;

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

    const { chatId, trackId, djId, receiveDJId, message, createdAt, isReply, replyTo } = data;

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
    return response.get();
  }

  async update(messageIds: (number | string)[], options: { transaction: Transaction }) { 
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
    return response;
  }

  async findOne(findOptions: FindOptions, options?: { transaction: Transaction }) {
    const response = options ? await this.messageModel.findOne({
      ...findOptions,
      ...options
    }) : await this.messageModel.findOne(findOptions);
    return response?.get();
  }

  async findAll(findOptions: FindOptions, options?: { transaction: Transaction }) {
    const response = options ? await this.messageModel.findAll({
      ...findOptions,
      ...options
    }) : await this.messageModel.findAll(findOptions);
    return response.map((message) => message.get());
  }

  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.messageModel.destroy({ where, ...options });
    return response;
  }
}