import { WhereOptions } from 'sequelize';
import SequelizeChat from '../database/models/SequelizeChat';

export default class ChatModel {
  private chatModel = SequelizeChat;

  async create(trackId: number, p0?: unknown) {
    const response = await this.chatModel.create({ trackId });
    return response.get();
  }

  async delete(where: WhereOptions, p0?: unknown) {
    const response = await this.chatModel.destroy({ where });
    return response;
  }
}