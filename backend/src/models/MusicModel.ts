import SequelizeMusic from "../database/models/SequelizeMusic";

export default class MusicModel {
  private musicModel = SequelizeMusic;

  async create( data: { musicURI: string; djId: number; trackId: number; }, p0?: unknown) {
    const { musicURI, djId, trackId } = data;
    const response = await this.musicModel.create({
      musicURI,
      djId,
      trackId,
    });

    return response.get();
  }

  async findAll(where?: { trackId?: number; }, p0?: unknown) {
    if (where) {
      const musics = await this.musicModel.findAll({ where });
      return musics.map(music => music.get());
    }
    const musics = await this.musicModel.findAll();
    return musics.map(music => music.get());
  }

  async findOne(where: { musicURI?: string; trackId?: number }, p0?: unknown) {
    const music = await this.musicModel.findOne({ where });
    return music?.get();
  }

  async delete(where: { id: number }) {
    const response = await this.musicModel.destroy({ where });
    return response;
  }
}