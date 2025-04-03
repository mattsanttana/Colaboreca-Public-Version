import { Transaction, WhereOptions } from 'sequelize';
import SequelizeDJ from '../database/models/SequelizeDJ';

// Classe responsável pelo modelo de DJ
export default class DJModel {
  private djModel = SequelizeDJ; // Instância do modelo de DJ

  // Método para criar um DJ
  async create(djName: string, characterPath: string, trackId: number, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e cria um DJ
    const response = options ?
      await this.djModel.create({ djName, characterPath, trackId }, options) :
        await this.djModel.create({ djName, characterPath, trackId });
    return response.get(); // Retorna o DJ criado
  }

  // Método para buscar todos os DJs
  async findAll(where: WhereOptions, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e busca todos os DJs
    const djs = options ?
      await this.djModel.findAll({ where, ...options }) :
        await this.djModel.findAll({ where });
    return djs.map(dj => dj.get()); // Retorna os DJs encontrados
  }

  // Método para buscar um DJ
  async findOne(where: WhereOptions, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e busca um DJ
    const dj = options ?
      await this.djModel.findOne({ where, ...options }) :
        await this.djModel.findOne({ where });
    return dj?.get(); // Retorna o DJ encontrado
  }

  // Método para atualizar um DJ
  async update(
    data: {
      djName?: string; characterPath?: string; score?: number; ranking?: number;
    }, where: WhereOptions, options?: { transaction: Transaction }
  ) {
    // Verifica se existem opções de transação e atualiza um DJ
    const response = options ?
      await this.djModel.update(data, { where, ...options }) :
        await this.djModel.update(data, { where });
    return response; // Retorna a resposta
  }

  // Método para deletar um DJ
  async delete(where: WhereOptions, options?: { transaction: Transaction }) {
    const response = await this.djModel.destroy({ where, ...options }); // Deleta um DJ
    return response; // Retorna a resposta
  }
}