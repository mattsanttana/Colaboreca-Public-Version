import { Transaction, WhereOptions } from 'sequelize';
import SequelizeTrack from '../database/models/SequelizeTrack';
import SequelizeDJ from '../database/models/SequelizeDJ';
import SequelizeMusic from '../database/models/SequelizeMusic';
import { ITrackQueueData } from '../interfaces/tracks/ITrack';

export default class TrackModel {
  private trackModel = SequelizeTrack;
  private djModel = SequelizeDJ;
  private musicModel = SequelizeMusic;

  async create(id: number, trackName: string, spotifyToken: string, options?: { transaction: Transaction }) {
    const response = await this.trackModel.create({ id, trackName, spotifyToken, createdAt: new Date(), updatedAt: new Date() }, options);
    return response.get();
  }

  async findAll(where?: WhereOptions, options?: { transaction: Transaction }) {
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
    return response.map((track) => track.toJSON()) as ITrackQueueData[];
  }

  async findOne(where: WhereOptions, options?: { transaction: Transaction }) {
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
    return response?.toJSON() as ITrackQueueData;
  }

  async update(data: { trackName?: string; updatedAt?: Date; }, where: WhereOptions, options?: { transaction: Transaction }) {
    const response = options ? await this.trackModel.update(data, { where, ...options }) : await this.trackModel.update(data, { where });
    return response;
  }


  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.trackModel.destroy({ where, ...options });
    return response;
  }
}