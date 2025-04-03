import { Transaction, WhereOptions } from 'sequelize';
import SequelizeTrack from '../database/models/SequelizeTrack';
import SequelizeDJ from '../database/models/SequelizeDJ';
import SequelizeMusic from '../database/models/SequelizeMusic';
import { ITrackQueueData } from '../interfaces/tracks/ITrack';

// Classe responsável pelo modelo de pista
export default class TrackModel {
  private trackModel = SequelizeTrack; // Instância do modelo de pista
  private djModel = SequelizeDJ; // Instância do modelo de DJ
  private musicModel = SequelizeMusic; // Instância do modelo de pista

  // Método para criar uma pista
  async create(id: number, trackName: string, spotifyToken: string, options?: { transaction: Transaction }) {
    // Cria uma pista
    const response = await this.trackModel.create(
      {id, trackName, spotifyToken, createdAt: new Date(), updatedAt: new Date() }, options
    );
    return response.get(); // Retorna a pista criada
  }

  // Método para buscar todas as pistas
  async findAll(where?: WhereOptions, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação ou de busca e busca todas as pistas
    const response = where ? options ? await this.trackModel.findAll({
      where,
      include: [{
        model: this.djModel,
        as: 'djs',
      },
      {
        model: this.musicModel,
        as: 'colaborecaQueue',
      }],
      ...options
    }) : await this.trackModel.findAll({
        where,
        include: [{
          model: this.djModel,
          as: 'djs',
        },
        {
          model: this.musicModel,
          as: 'colaborecaQueue',
        }]
      }) : options ? await this.trackModel.findAll({
        include: [{
          model: this.djModel,
          as: 'djs',
        },
        {
          model: this.musicModel,
          as: 'colaborecaQueue',
        }],
        ...options
      }) : await this.trackModel.findAll({
        include: [{
          model: this.djModel,
          as: 'djs',
        },
        {
          model: this.musicModel,
          as: 'colaborecaQueue',
        }]
      });
    return response.map((track) => track.toJSON()) as ITrackQueueData[]; // Retorna as pistas encontradas
  }

  // Método para buscar uma pista
  async findOne(where: WhereOptions, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e busca uma pista
    const response = options ? await this.trackModel.findOne({
      where,
      include: [{
        model: this.djModel,
        as: 'djs',
      },
      {
        model: this.musicModel,
        as: 'colaborecaQueue',
      }], ...options }) : await this.trackModel.findOne({
        where,
        include: [{
          model: this.djModel,
          as: 'djs',
        },
        {
          model: this.musicModel,
          as: 'colaborecaQueue',
        }]
      });
    return response?.toJSON() as ITrackQueueData; // Retorna a pista encontrada
  }

  // Método para atualizar uma pista
  async update(data: { trackName?: string; updatedAt?: Date; }, where: WhereOptions, options?: { transaction: Transaction }) {
    // Atualiza uma pista
    const response = options ?
      await this.trackModel.update(data, { where, ...options }) :
        await this.trackModel.update(data, { where });
    return response; // Retorna a resposta
  }

  // Método para deletar uma pista
  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.trackModel.destroy({ where, ...options }); // Deleta uma pista
    return response; // Retorna a resposta
  }
}