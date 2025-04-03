import { Transaction, WhereOptions } from 'sequelize';
import SequelizeVote from '../database/models/SequelizeVote';
import { Vote } from '../interfaces/votes/IVote';

// Classe responsável pelo modelo de voto
export default class VoteModel {
  private voteModel = SequelizeVote; // Instância do modelo de voto

  // Método para criar um voto
  async create(data: { djId: number; musicId: number; vote: Vote, trackId: number }, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e cria um voto
    const vote = options ?
      await this.voteModel.create(data, options) :
        await this.voteModel.create(data);
    return vote.get(); // Retorna o voto criado
  }

  // Método para buscar um voto
  async findOne(where: WhereOptions) {    
    const vote = await this.voteModel.findOne({ where }); // Busca um voto
    return vote?.get(); // Retorna o voto encontrado
  }

  // Método para buscar todos os votos
  async findAll(where: WhereOptions) {
    const votes = await this.voteModel.findAll({ where }); // Busca todos os votos
    return votes.map((vote) => vote.get()); // Retorna os votos encontrados
  }

  // Método para atualizar um voto
  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.voteModel.destroy({ where, ...options }); // Deleta um voto
    return response; // Retorna a resposta
  }
}