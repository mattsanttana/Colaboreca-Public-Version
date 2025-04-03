import { Transaction, WhereOptions } from "sequelize";
import SequelizeDJ from "../database/models/SequelizeDJ";
import SequelizeMusic from "../database/models/SequelizeMusic";
import SequelizeVote from "../database/models/SequelizeVote";
import { IMusicWithDJAndVotes } from "../interfaces/musics/IMusic";

// Classe responsável pelo modelo de música
export default class MusicModel {
  private musicModel = SequelizeMusic; // Instância do modelo de música
  private voteModel = SequelizeVote; // Instância do modelo de voto
  private djModel = SequelizeDJ; // Instância do modelo de DJ

  // Método para criar uma música
  async create(data: {
    cover: string, name: string, artists: string, musicURI: string; djId: number; trackId: number;
  }, options: { transaction: Transaction }) {
    const { cover, name, artists, musicURI, djId, trackId } = data; // Destruturação dos dados
    // Cria uma música
    const response = await this.musicModel.create({
      cover,
      name,
      artists,
      musicURI,
      djId,
      trackId,
    }, options);
    return response.get(); // Retorna a música criada
  }

  // Método para buscar todas as músicas
  async findAll(where?: { djId?: number, trackId?: number, musicURI?: string }, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação ou de busca e busca todas as músicas
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
    return musics.map(music => music.toJSON()) as IMusicWithDJAndVotes[]; // Retorna as músicas encontradas
  }

  // Método para buscar uma música
  async findOne(where: { id?: number; musicURI?: string; trackId?: number, pointsApllied?: boolean }, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e busca uma música
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
    return music?.toJSON() as IMusicWithDJAndVotes; // Retorna a música encontrada
  }

  // Método para contar músicas
  async count(where: { djId?: number; trackId?: number; musicURI?: string, pointsApllied: boolean }, options?: { transaction: Transaction }) {
    // Verifica se existem opções de transação e conta as músicas
    const count = options ?
      await this.musicModel.count({ where, ...options }) :
        await this.musicModel.count({ where });
    return count; // Retorna a contagem
  }

  // Método para atualizar uma música
  async update(data: { pointsApllied: boolean }, where: { id: number }, options: { transaction: Transaction }) {
    const response = await this.musicModel.update(data, { where, ...options }); // Atualiza uma música
    return response; // Retorna a resposta
  }

  // Método para deletar uma música
  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.musicModel.destroy({ where, ...options }); // Deleta uma música
    return response; // Retorna a resposta
  }
}