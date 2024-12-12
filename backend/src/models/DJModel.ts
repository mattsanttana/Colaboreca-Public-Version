import { FindOptions, WhereOptions } from 'sequelize';
import SequelizeDJ from '../database/models/SequelizeDJ';

export default class DJModel {
  private djModel = SequelizeDJ;

  async create(djName: string, characterPath: string, trackId: number, p0?: unknown) {
    const response = await this.djModel.create({ djName, characterPath, trackId });
    return response.get();
  }

  async findAll(where: WhereOptions, po?: unknown) {
    const djs = await this.djModel.findAll({ where });
    return djs.map(dj => dj.get());
  }

  async findAllWithOptions(options: FindOptions) {
    const djs = await this.djModel.findAll(options);
    return djs.map(dj => dj.get());
  }

  async findOne(where: WhereOptions, p0?: unknown) {
    const dj = await this.djModel.findOne({ where });
    return dj?.get();
  }

  async update(
    data: { 
      djName?: string; characterPath?: string; score?: number; ranking?: number; 
    }, where: WhereOptions, p0?: unknown
  ) {
    const response = await this.djModel.update(data, { where });
    return response;
  }

  async delete(where: WhereOptions, p0?: unknown) {
    const response = await this.djModel.destroy({ where });
    return response;
  }
}