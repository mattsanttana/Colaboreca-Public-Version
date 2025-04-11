import { Op, Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import ChatModel from '../models/ChatModel';
import DJModel from '../models/DJModel';
import MessageModel from '../models/MessageModel';
import MusicModel from '../models/MusicModel';
import TrackModel from '../models/TrackModel';
import VoteModel from '../models/VoteModel';
import generateShortId from '../utils/generateShortId';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';
import SpotifyActions from '../utils/SpotifyActions';

// Essa é classe que contém toda a lógica de negócio para a pista
export default class TrackService {
  constructor(
    // Injetar as dependências necessárias
    private chatModel: ChatModel = new ChatModel(),
    private djModel: DJModel = new DJModel(),
    private messageModel: MessageModel = new MessageModel(),
    private musicModel: MusicModel = new MusicModel(),
    private sequelize: Sequelize = new Sequelize(config),
    private trackModel: TrackModel = new TrackModel(),
    private voteModel: VoteModel = new VoteModel()
  ) { }

  // Método para criar uma pista
  async createTrack(data: { trackName: string, code: string }) {
    const { trackName, code } = data; // Receber os dados da pista

    try {
      const spotifyToken = await SpotifyActions.getAccessToken(code); // Obter o token de acesso do Spotify

      // Se o token de acesso for inválido, retorne uma mensagem de erro
      if (!spotifyToken) {
        throw new Error('Invalid access code');
      }

      const isValidToken = await SpotifyActions.refreshAccessToken(spotifyToken); // Atualizar o token de acesso

      const isPremium = await SpotifyActions.getCurrentUser(isValidToken); // Verificar se o usuário tem uma conta premium

      // Se o usuário não tiver uma conta premium, retorne uma mensagem de erro
      if (isPremium.product !== 'premium') {
        return { status: 'UNAUTHORIZED', data: { message: 'You need a premium account to use this service' } };
      }

      await this.deleteAllTracksWithSixHoursAbsence(); // Deletar todas as pistas com ausência de seis horas

      let id = generateShortId(); // Gerar um ID para a pista

      // Se o ID não for gerado, retorne uma mensagem de erro
      if (!id) {
        throw new Error('Error generating ID');
      }

      let trackWithId = await this.trackModel.findOne({ id }); // Verificar se já existe uma pista com esse ID

      // Enquanto houver uma pista com o ID ou o ID não tiver seis caracteres, gere um novo ID
      while (trackWithId || id.toString().length !== 6) {
        id = generateShortId();
        trackWithId = await this.trackModel.findOne({ id });
      }

      const track = await this.trackModel.create(id, trackName, spotifyToken); // Criar a pista


      const token = JWT.sign({ id: track.id }); // Gerar um token para a pista


      if (!track) {
        return { status: 'ERROR', data: { message: 'An error occurred' } }; // Se a pista não for criada, retorne uma mensagem de erro
      }

      return { status: 'CREATED', data: { id, trackName, token } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para buscar uma pista pelo ID
  async findTrackById(id: number) {
    try {
      const response = await this.trackModel.findOne({ id }); // Buscar a pista pelo ID

      // Se a pista não for encontrada, retorne uma mensagem de erro
      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      return { status: 'OK', data: response }; // Retornar a pista com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método parar verificar se o dispositivo já tem uma pista criada
  async verifyIfTrackAlreadyBeenCreated(authorization: string) {
    try {
      const token = authorization.split(' ')[1]; // Obter o token do cabeçalho de autorização
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: decoded.id }); // Buscar a pista pelo ID

      // Se a pista não for encontrada, retorne uma mensagem de pista não encontrada
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      return { status: 'OK', data: track.id };  // Retornar o ID da pista com o status correspondente
    } catch (error) {
      console.error(error);
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para verificar o acesso à pista
  async verifyTrackAccess(id: number, authorization: string) {
    try {
      const token = authorization.split(' ')[1]; // Obter o token do cabeçalho de autorização
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      // Se o ID do token for diferente do ID da pista, retorne uma mensagem de erro
      if (decoded.id !== id) {
        return { status: 'UNAUTHORIZED', data: { message: 'Unauthorized' } };
      }

      return { status: 'OK', data: { message: 'Authorized' } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para atualizar uma pista
  async updateTrack(trackName: string, authorization: string) {
    const io = getSocket(); // Obter a instância do Socket.IO

    try {
      const token = authorization.split(' ')[1]; // Obter o token do cabeçalho de autorização
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: decoded.id }); // Buscar a pista pelo ID

      // Se a pista não for encontrada, retorne uma mensagem de pista não encontrada
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      // Inicializar os campos atualizados
      const updatedFields: Partial<{ trackName: string, updatedAt: Date }> = {};
      if (trackName !== undefined && trackName !== track.trackName) {
        // Se o nome da pista for diferente do nome atual, atualize o nome da pista e a data de atualização
        updatedFields['trackName'] = trackName;
        updatedFields['updatedAt'] = new Date();
      }

      // Se nenhum campo for atualizado, retorne uma mensagem de erro
      if (Object.keys(updatedFields).length === 0) {
        return { status: 'INVALID_DATA', data: { message: 'No fields updated' } };
      }

      const response = await this.trackModel.update(updatedFields as { trackName: string, updatedAt: Date }, { id: decoded.id }); // Atualizar a pista

      // Se a pista não for atualizada, retorne uma mensagem de erro
      if (response[0] === 0) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const trackUpdated = await this.trackModel.findOne({ id: decoded.id }); // Buscar a pista atualizada

      io.to(`track_${decoded.id}`).emit('track updated', { trackName: trackUpdated?.trackName }); // Emitir um evento de pista atualizada

      return { status: 'OK', data: { message: 'Track updated' } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      console.error(error);
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para deletar uma pista
  async deleteTrack(authorization: string) {
    const transaction = await this.sequelize.transaction(); // Iniciar uma transação
    const io = getSocket(); // Obter a instância do Socket.IO

    try {
      const token = authorization.split(' ')[1]; // Obter o token do cabeçalho de autorização
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: decoded.id }); // Buscar a pista pelo ID

      // Se a pista não for encontrada, retorne uma mensagem de pista não encontrada
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const trackId = decoded.id; // Pegar o ID da pista

      // Deletar entradas relacionadas nas tabelas Chat, DJ, Message, Music, Vote e a própria pista
      await Promise.all([
        this.chatModel.delete({ trackId }, { transaction }),
        this.djModel.delete({ trackId }, { transaction }),
        this.messageModel.delete({ trackId }, { transaction }),
        this.musicModel.delete({ trackId }, { transaction }),
        this.voteModel.delete({ trackId }, { transaction }),
        this.trackModel.delete({ id: trackId }, { transaction })
      ]);


      io.to(`track_${decoded.id}`).emit('track deleted', { trackId: decoded.id }); // Emitir um evento de pista deletada

      await transaction.commit(); // Commitar a transação

      return { status: 'OK', data: { message: 'Track deleted' } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      await transaction.rollback();
      // Se ocorrer um erro, rollback a transação, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para deletar todas as pistas com ausência de seis horas
  async deleteAllTracksWithSixHoursAbsence() {
    const transaction = await this.sequelize.transaction(); // Iniciar uma transação
    const io = getSocket(); // Obter a instância do Socket.IO
    try {
      // Buscar todas as pistas com ausência de seis horas
      const tracksToDelete = await this.trackModel.findAll({
        updatedAt: {
          [Op.lt]: new Date(new Date().getTime() - 1000 * 60 * 60 * 6)
        }
      });

      // Se não houver pistas para deletar, retorne uma mensagem de erro
      for (const track of tracksToDelete) {
        const trackId = track.id;

        // Deletar entradas relacionadas nas tabelas Chat, DJ, Message, Music e Vote
        await Promise.all([
          this.chatModel.delete({ trackId }, { transaction }),
          this.djModel.delete({ trackId }, { transaction }),
          this.messageModel.delete({ trackId }, { transaction }),
          this.musicModel.delete({ trackId }, { transaction }),
          this.voteModel.delete({ trackId }, { transaction }),
          this.trackModel.delete({ id: trackId }, { transaction }) // Deletar a pista
        ]);

        io.to(`track_${trackId}`).emit('track deleted', { trackId }); // Emitir um evento de pista deletada
      }

      await transaction.commit(); // Commitar a transação

      return { status: 'OK', data: { message: `${tracksToDelete.length} tracks deleted` } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, rollback a transação, exiba no console e retorne uma mensagem de erro
      await transaction.rollback();
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para deletar um DJ
  async deleteDJ(id: number, authorization: string) {
    const io = getSocket(); // Obter a instância do Socket.IO

    try {
      const token = authorization.split(' ')[1]; // Obter o token do cabeçalho de autorização
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const response = await this.djModel.delete({ id }); // Deletar o DJ

      // Se o DJ não for deletado, retorne uma mensagem de erro
      if (response === 0) {
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      io.to(`track_${decoded.id}`).emit('dj deleted', { id }); // Emitir um evento de DJ deletado

      return { status: 'OK', data: { message: 'DJ deleted' } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }
}
