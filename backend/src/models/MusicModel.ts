import { WhereOptions } from "sequelize";
import SequelizeMusic from "../database/models/SequelizeMusic";

export default class MusicModel {
  private musicModel = SequelizeMusic;

  async create(data: { cover: string, name: string, artists: string, musicURI: string; djId: number; trackId: number; }, p0?: unknown) {
    const { cover, name, artists, musicURI, djId, trackId } = data;
    const response = await this.musicModel.create({
      cover,
      name,
      artists,
      musicURI,
      djId,
      trackId,
    });

    return response.get();
  }

  async findAll(where?: { djId?: number, trackId?: number, musicURI?: string }, p0?: unknown) {
    if (where) {
      const musics = await this.musicModel.findAll({ where });
      return musics.map(music => music.get());
    }
    const musics = await this.musicModel.findAll();
    return musics.map(music => music.get());
  }

  async findOne(where: { id?: number; musicURI?: string; trackId?: number, pointsApllied?: boolean }, p0?: unknown) {
    const music = await this.musicModel.findOne({ where });
    
    return music?.get();
  }

  async count(where: { djId?: number; trackId?: number; musicURI?: string, pointsApllied: boolean }, p0?: unknown) {
    const count = await this.musicModel.count({ where });

    return count;
  }

  async update(data: { pointsApllied: boolean }, where: { id: number }, p0?: unknown) {
    const response = await this.musicModel.update(data, { where });

    return response;
  }

  async delete(where: WhereOptions, p0?: unknown) {
    const response = await this.musicModel.destroy({ where });
    return response;
  }
}