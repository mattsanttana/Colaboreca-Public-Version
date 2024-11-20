import { FindOptions } from "sequelize";
import SequelizeMessage from "../database/models/SequelizeMessage";

export default class MessageModel {
  private messageModel = SequelizeMessage;

  async create(data: { chatId: number | null, djId: number, receiveDJId: number | null, message: string, createdAt: Date }, p0?: unknown) {
    const { chatId, djId, receiveDJId, message, createdAt } = data;
    const response = await this.messageModel.create({
      chatId,
      djId,
      receiveDJId,
      message,
      createdAt,
    });

    return response.get();
  }

  async findOne(options: FindOptions, p0?: unknown) {
    const response = await this.messageModel.findOne(options);
    return response?.get();
  }
}