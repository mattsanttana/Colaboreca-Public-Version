import { Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import MusicModel from '../models/MusicModel';
import TrackModel from '../models/TrackModel';
import { Music } from '../interfaces/spotify_response/SpotifyResponse';
import JWT from '../utils/JWT';
import PlaybackActions from '../utils/PlaybackActions';
import { getSocket } from '../utils/socketIO';
import SpotifyActions from '../utils/SpotifyActions';

// Essa classe contém toda a lógica de negócio relacionada à reprodução de músicas
export default class PlaybackService {
  constructor(
    // Injeção de dependências
    private musicModel: MusicModel = new MusicModel(),
    private sequelize: Sequelize = new Sequelize(config),
    private trackModel: TrackModel = new TrackModel(),
  ) { }

  // Método para buscar o estado de reprodução atual
  async findPlaybackState(id: number) {
    try {
      const track = await this.trackModel.findOne({ id }) // Buscar a pista pelo ID

      // Se a pista não for encontrada, retornar um erro
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const token = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify

      // Se o token não for válido, retornar um erro
      if (!token) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const response = await SpotifyActions.getPlaybackState(token); // Buscar o estado de reprodução atual

      // Se ocorrer um erro, retornar um erro
      if (!response) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      return { status: 'OK', data: response.data }; // Retornar o estado de reprodução atual
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

  // Método para buscar as músicas populares no Brasil
  async findTopTracksInBrazil(trackId: number) {
    try {
      const track = await this.trackModel.findOne({ id: trackId }); // Buscar a pista pelo ID

      // Se a pista não for encontrada, retornar um erro
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify

      const response = await SpotifyActions.getTopTracksInBrazil(spotifyToken); // Buscar as músicas populares no Brasil

      // Se ocorrer um erro, retornar um erro
      if (!response) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      return { status: 'OK', data: response }; // Retornar as músicas populares no Brasil
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

  // Método para buscar uma músicas pelo nome
  async findTrackBySearch(trackId: number, search: string) {
    try {
      const track = await this.trackModel.findOne({ id: trackId }); // Buscar a pista pelo ID

      // Se a pista não for encontrada, retornar um erro
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify

      const response = await SpotifyActions.getTrackBySearch(spotifyToken, search); // Buscar as músicas pelo nome

      // Se ocorrer um erro, retornar um erro
      if (!response) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      return { status: 'OK', data: response }; // Retornar as músicas encontradas pelo nome informado na busca e o status correspondente
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

  // Método para buscar a fila de músicas do Colaboreca
  async findQueue(trackId: number) {
    try {
      const track = await this.trackModel.findOne({ id: trackId }); // Buscar os dados da pist

      // Se os dados da pista não forem encontrados, retornar um erro
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify

      // Se a fila do Spotify não for encontrada, retornar um erro
      if (!spotifyToken) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const spotifyQueue = await SpotifyActions.getQueue(spotifyToken); // Buscar a fila de músicas do Spotify

      const completeQueue = PlaybackActions.getQueue(spotifyQueue, track.colaborecaQueue, track.djs, track.trackName); // Construir a fila completa associando DJs e músicas do Spotify

      return { status: 'OK', data: completeQueue }; // Retornar a fila completa e o status correspondente
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

  // Método pra buscar a fila de músicas do Spotify
  async findSpotifyQueue(trackId: number) {
    try {
      const track = await this.trackModel.findOne({ id: trackId }); // Buscar a pista pelo ID

      // Se a pista não for encontrada, retornar um erro
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify

      const response = await SpotifyActions.getQueue(spotifyToken); // Buscar a fila de músicas do Spotify

      // Se ocorrer um erro, retornar um erro
      if (!response) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      return { status: 'OK', data: response.queue }; // Retornar a fila de músicas do Spotify e o status correspondente 
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

  // Método para buscar as músicas adicionadas por um DJ
  async findAddedMusicsByDJ(djId: number, trackId: number) {
    try {
      const track = await this.trackModel.findOne({ id: trackId }); // Buscar os dados da pista

      // Se os dados da pista não forem encontrados, retornar um erro
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'DJ or Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify
      const spotifyQueue = await SpotifyActions.getQueue(spotifyToken); // Buscar a fila de músicas do Spotify
      const colaborecaQueue = track.colaborecaQueue.filter((colaborecaTrack: any) => colaborecaTrack.djId === djId); // Filtrar a fila do Colaboreca pelo DJ

      // Se a fila do Spotify ou do Colaboreca não forem encontradas, retornar um erro
      if (!spotifyQueue || !colaborecaQueue) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const completeQueue = PlaybackActions.getMusicAddedBy(spotifyQueue, colaborecaQueue); // Construir a fila completa associando DJs e músicas do Spotify

      return { status: 'OK', data: completeQueue }; // Retornar a fila completa e o status correspondente
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

  // Método para buscar a música adicionada pelo DJ que está tocando no momento
  async findDJAddedCurrentMusic(trackId: number) {
    try {
      const track = await this.trackModel.findOne({ id: trackId }); // Buscar os dados da pista

      // Se os dados da pista não forem encontrados, retornar um erro
      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track or DJs not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify
      const spotifyQueue = await SpotifyActions.getQueue(spotifyToken); // Buscar a fila de músicas do Spotify

      // Se a fila do Spotify não for encontrada, retornar um erro
      if (!spotifyQueue) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const data = PlaybackActions.getDJAddedCurrentMusic(spotifyQueue, track.colaborecaQueue, track.djs); // Pegar todas as informações do DJ que adicionou a música

      return { status: 'OK', data }; // Retornar as informações da música que está tocando no momento e o status correspondente
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

  // Método para adicionar uma música à fila
  async addTrackToQueue(
    trackId: number,
    musicData: { cover: string, name: string, artists: string, musicURI: string },
    authorization: string
  ) {
    const transaction = await this.sequelize.transaction(); // Iniciar uma transação
    const io = getSocket(); // Buscar a instância do socket
    const { cover, name, artists, musicURI } = musicData; // Desestruturar os dados da música

    try {
      const token = authorization.split(' ')[1]; // Separar o token do cabeçalho de autorização
      const decoded = JWT.verify(token); // Verificar o token

      // Se o token não for válido, retornar um erro
      if (typeof decoded === 'string') {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: trackId }, { transaction }); // Buscar os dados da pista

      // Se os dados da pista não forem encontrados, retornar um erro
      if (!track) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Track not found' } };
      }

      const dj = track.djs.find((dj) => dj.id === decoded.id); // Buscar o DJ

      // Se o DJ não for encontrado, retornar um erro
      if (!dj) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'DJ not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualizar o token do Spotify

      const currentQueue = await SpotifyActions.getQueue(spotifyToken); // Buscar a fila de músicas do Spotify
      const currentQueueURIs = currentQueue?.queue?.map((track: Music) => track.uri) ?? []; // Buscar as URIs das músicas na fila

      // Verificar se a música já está na fila ou se está tocando no momento
      const isMusicAlreadyInQueue = currentQueueURIs.includes(musicURI) ||
        currentQueue.currently_playing?.uri === musicURI;
      // Se a música já estiver na fila ou estiver tocando no momento, retornar um erro
      if (isMusicAlreadyInQueue) {
        await transaction.rollback();
        return { status: 'CONFLICT', data: { message: 'Music is already in queue or currently playing' } };
      }

      // Verificar se o DJ já tem 3 músicas na fila que ainda não foram tocadas
      const djMusicCount = await this.musicModel.count({ djId: dj.id, trackId, pointsApllied: false }, { transaction });

      // Se o DJ já tiver 3 músicas na fila que ainda não foram tocadas, retornar um erro
      if (djMusicCount >= 3) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'DJ already has 3 songs in the queue' } };
      }

      const addedToQueue = await SpotifyActions.addTrackToQueue(spotifyToken, musicURI); // Adicionar a música à fila do Spotify

      // Se a música não for adicionada à fila, retornar um erro
      if (!addedToQueue) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Player command failed: No active device found' } };
      }

      // Criar a música na fila
      const response = await this.musicModel.create({
        cover,
        name,
        artists,
        musicURI,
        djId: dj.id as number,
        trackId: trackId,
      }, { transaction });

      // Se a música não for criada, retornar um erro
      if (!response) {
        await transaction.rollback();
        return { status: 'Error', data: { message: 'An error occurred' } };
      }

      await this.trackModel.update({ updatedAt: new Date() }, { id: trackId }, { transaction }); // Atualizar a pista

      const spotifyQueue = await SpotifyActions.getQueue(spotifyToken); // Buscar a fila de músicas do Spotify atualizada
      const colaborecaQueue = await this.musicModel.findAll({ trackId }, { transaction }); // Buscar a fila de músicas do Colaboreca atualizada
      const queue = PlaybackActions.getQueue(spotifyQueue, colaborecaQueue, track.djs, track.trackName); // Construir a fila completa

      io.to(`track_${trackId}`).emit('queue updated', { queue, spotifyQueue }); // Emitir um evento de atualização da fila

      await transaction.commit(); // Confirmar a transação

      return { status: 'OK', data: response }; // Retornar a música criada e o status correspondente
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
}