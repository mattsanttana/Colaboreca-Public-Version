import { WhereOptions } from 'sequelize';
import SequelizeVote from '../database/models/SequelizeVote';

export default class VoteModel {
  private voteModel = SequelizeVote;

  async findOne(where: WhereOptions, p0?: unknown) {    
    const vote = await this.voteModel.findOne({ where });
    return vote?.get();
  }
}