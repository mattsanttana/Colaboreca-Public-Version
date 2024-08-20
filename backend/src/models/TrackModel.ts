import { FindOptions, WhereOptions } from 'sequelize';
import SequelizeTrack from '../database/models/SequelizeTrack';

export default class TrackModel {
  private trackModel = SequelizeTrack;

  async create(id: number, trackName: string, spotifyToken: string, p0?: unknown) {
    const response = await this.trackModel.create({ id, trackName, spotifyToken, createdAt: new Date(), updatedAt: new Date() });
    return response.get();
  }

  async findAll(p0?: unknown) {
    const response = await this.trackModel.findAll();
    return response.map((track) => track.get());
  }

  async findOne(where: WhereOptions, p0?: unknown) {
    const response = await this.trackModel.findOne({ where });
    return response?.get();
  }

  async update(data: { trackName?: string; updatedAt?: Date; }, where: WhereOptions, p0?: unknown) {
    const response = await this.trackModel.update(data, { where });
    return response;
  }


  async delete(options: FindOptions, p0?: unknown) {
    const response = await this.trackModel.destroy(options);
    return response;
  }
}