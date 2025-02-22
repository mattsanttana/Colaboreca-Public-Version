import { Transaction, WhereOptions } from 'sequelize';
import SequelizeChat from '../database/models/SequelizeChat';

export default class ChatModel {
  private chatModel = SequelizeChat;

  async create(trackId: number, options: { transaction: Transaction }) {
    const response = await this.chatModel.create({ trackId }, options);
    return response.get();
  }

  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.chatModel.destroy({ where, ...options });
    return response;
  }
}