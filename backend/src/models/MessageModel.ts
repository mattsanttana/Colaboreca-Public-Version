import { FindOptions, WhereOptions } from "sequelize";
import SequelizeMessage from "../database/models/SequelizeMessage";
import { Op } from 'sequelize';

export default class MessageModel {
  private messageModel = SequelizeMessage;

  async create(data: { chatId: number | null, trackId: number, djId: number, receiveDJId: number | null, message: string, createdAt: Date }, p0?: unknown) {
    const { chatId, trackId, djId, receiveDJId, message, createdAt } = data;
    const response = await this.messageModel.create({
      chatId,
      trackId,
      djId,
      receiveDJId,
      message,
      createdAt,
    });

    return response.get();
  }

  async update(messageIds: (number | string)[], p0?: unknown) { 
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
      }
    );
  
    return response;
  }

  async findOne(options: FindOptions, p0?: unknown) {
    const response = await this.messageModel.findOne(options);
    return response?.get();
  }

  async findAll(options: FindOptions, p0?: unknown) {
    const response = await this.messageModel.findAll(options);
    return response.map((message) => message.get());
  }

  async delete(where: WhereOptions, p0?: unknown) {
    const response = await this.messageModel.destroy({ where });
    return response;
  }
}