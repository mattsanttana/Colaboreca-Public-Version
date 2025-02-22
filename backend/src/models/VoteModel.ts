import { Transaction, WhereOptions } from 'sequelize';
import SequelizeVote from '../database/models/SequelizeVote';
import { Vote } from '../interfaces/votes/IVote';

export default class VoteModel {
  private voteModel = SequelizeVote;

  async create(data: { djId: number; musicId: number; vote: Vote, trackId: number }, options?: { transaction: Transaction }) {
    const vote = options ? await this.voteModel.create(data, options) : await this.voteModel.create(data);
    return vote.get();
  }

  async findOne(where: WhereOptions) {    
    const vote = await this.voteModel.findOne({ where });
    return vote?.get();
  }

  async findAll(where: WhereOptions) {
    const votes = await this.voteModel.findAll({ where });
    return votes.map((vote) => vote.get());
  }

  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.voteModel.destroy({ where, ...options });
    return response;
  }
}