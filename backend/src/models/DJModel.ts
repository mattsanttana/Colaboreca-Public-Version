import { Transaction, WhereOptions } from 'sequelize';
import SequelizeDJ from '../database/models/SequelizeDJ';

export default class DJModel {
  private djModel = SequelizeDJ;

  async create(djName: string, characterPath: string, trackId: number, options?: { transaction: Transaction }) {
    const response = options ? await this.djModel.create({ djName, characterPath, trackId }, options) : await this.djModel.create({ djName, characterPath, trackId });
    return response.get();
  }

  async findAll(where: WhereOptions, options?: { transaction: Transaction }) {
    const djs = options ? await this.djModel.findAll({ where, ...options }) : await this.djModel.findAll({ where });
    return djs.map(dj => dj.get());
  }

  async findOne(where: WhereOptions, options?: { transaction: Transaction }) {
    const dj = options ? await this.djModel.findOne({ where, ...options }) : await this.djModel.findOne({ where });
    return dj?.get();
  }

  async update(
    data: {
      djName?: string; characterPath?: string; score?: number; ranking?: number;
    }, where: WhereOptions, options?: { transaction: Transaction }
  ) {
    const response = options ? await this.djModel.update(data, { where, ...options }) : await this.djModel.update(data, { where });
    return response;
  }

  async delete(where: WhereOptions, options?: { transaction: Transaction }) {
    const response = await this.djModel.destroy({ where, ...options });
    return response;
  }
}