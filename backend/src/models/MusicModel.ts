import { Transaction, WhereOptions } from "sequelize";
import SequelizeDJ from "../database/models/SequelizeDJ";
import SequelizeMusic from "../database/models/SequelizeMusic";
import SequelizeVote from "../database/models/SequelizeVote";
import { IMusicWithDJAndVotes } from "../interfaces/musics/IMusic";

export default class MusicModel {
  private musicModel = SequelizeMusic;
  private voteModel = SequelizeVote;
  private djModel = SequelizeDJ;

  async create(data: { cover: string, name: string, artists: string, musicURI: string; djId: number; trackId: number; }, options: { transaction: Transaction }) {
    const { cover, name, artists, musicURI, djId, trackId } = data;
    const response = await this.musicModel.create({
      cover,
      name,
      artists,
      musicURI,
      djId,
      trackId,
    }, options);

    return response.get();
  }

  async findAll(where?: { djId?: number, trackId?: number, musicURI?: string }, options?: { transaction: Transaction }) {
    const musics = where ? options ? await this.musicModel.findAll({
      where,
      include: [{
        model: this.djModel,
        as: 'dj',
      },
      {
        model: this.voteModel,
        as: 'votes',
      }], ...options
    })
      : await this.musicModel.findAll({
        where,
        include: [{
          model: this.djModel,
          as: 'dj',
        },
        {
          model: this.voteModel,
          as: 'votes',
        }],
      }) : options ? await this.musicModel.findAll({
        include: [{
          model: this.djModel,
          as: 'dj',
        },
        {
          model: this.voteModel,
          as: 'votes',
        }], ...options
      }) : await this.musicModel.findAll({
        include: [{
          model: this.djModel,
          as: 'dj',
        },
        {
          model: this.voteModel,
          as: 'votes',
        }],
      });
    return musics.map(music => music.toJSON()) as IMusicWithDJAndVotes[];
  }

  async findOne(where: { id?: number; musicURI?: string; trackId?: number, pointsApllied?: boolean }, options?: { transaction: Transaction }) {
    const music = options ? await this.musicModel.findOne({
      where,
      include: [{
        model: this.djModel,
        as: 'dj',
      },
      {
        model: this.voteModel,
        as: 'votes',
      }], ...options
    }) : await this.musicModel.findOne({
      where,
      include: [{
        model: this.djModel,
        as: 'dj',
      },
      {
        model: this.voteModel,
        as: 'votes',
      }],
    });
    return music?.toJSON() as IMusicWithDJAndVotes;
  }

  async count(where: { djId?: number; trackId?: number; musicURI?: string, pointsApllied: boolean }, options?: { transaction: Transaction }) {
    const count = options ? await this.musicModel.count({ where, ...options }) : await this.musicModel.count({ where });
    return count;
  }

  async update(data: { pointsApllied: boolean }, where: { id: number }, options: { transaction: Transaction }) {
    const response = await this.musicModel.update(data, { where, ...options });
    return response;
  }

  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.musicModel.destroy({ where, ...options });
    return response;
  }
}