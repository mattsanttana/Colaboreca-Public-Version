import { Transaction, WhereOptions } from 'sequelize';
import SequelizeChat from '../database/models/SequelizeChat';

// Classe responsável pelo modelo de chat
export default class ChatModel {
  private chatModel = SequelizeChat; // Instância do modelo de chat

  // Método para criar um chat
  async create(trackId: number, options: { transaction: Transaction }) {
    const response = await this.chatModel.create({ trackId }, options); // Cria um chat
    return response.get(); // Retorna o chat criado
  }

  // Método para buscar um chat
  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.chatModel.destroy({ where, ...options }); // Deleta um chat
    return response; // Retorna a resposta
  }
}