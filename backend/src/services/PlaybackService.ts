import { Sequelize } from 'sequelize';
import MusicModel from '../models/MusicModel';
import TrackModel from '../models/TrackModel';
import DJModel from '../models/DJModel';
import SpotifyActions from '../utils/SpotifyActions';
import JWT from '../utils/JWT';
import { Track } from '../interfaces/spotify_response/SpotifyResponse';
import * as config from '../database/config/database';

export default class PlaybackService {
  constructor(
    private sequelize: Sequelize = new Sequelize(config),
    private trackModel: TrackModel = new TrackModel(),
    private djModel: DJModel = new DJModel(),
    private musicModel: MusicModel = new MusicModel()
  ) { }

  async findPlaybackState(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const track = await this.trackModel.findOne({ id }, { transaction });

      if (!track) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const token = await SpotifyActions.refreshAccessToken(track.spotifyToken);

      if (!token) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const response = await SpotifyActions.getPlaybackState(token);

      if (!response) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      await transaction.commit();
      return { status: 'OK', data: response.data };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findTopTracksInBrazil(trackId: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const track = await this.trackModel.findOne({ id: Number(trackId) }, { transaction });

      if (!track) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);

      const response = await SpotifyActions.getTopTracksInBrazil(spotifyToken);

      if (!response) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      await transaction.commit();
      return { status: 'OK', data: response };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findTrackBySearch(trackId: string, search: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const track = await this.trackModel.findOne({ id: Number(trackId) }, { transaction });

      if (!track) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);

      const response = await SpotifyActions.getTrackBySearch(spotifyToken, search);

      if (!response) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      await transaction.commit();
      return { status: 'OK', data: response };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findQueue(trackId: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const track = await this.trackModel.findOne({ id: Number(trackId) }, { transaction });
      const djs = await this.djModel.findAll({ trackId: Number(trackId) }, { transaction });
  
      if (!track || !djs) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      } 
  
      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);
  
      const spotifyQueue = await SpotifyActions.getQueue(spotifyToken);
      const colaborecaQueue = await this.musicModel.findAll({ trackId: Number(trackId)}, { transaction });
  
      if (!spotifyQueue || !colaborecaQueue) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }
  
      // Construir a fila completa associando DJs e músicas do Spotify
      const completeQueue = spotifyQueue.queue.map((spotifyTrack: any) => {
        const responseTrack = {
          cover: spotifyTrack.album.images[0].url,
          musicName: spotifyTrack.name,
          artists: spotifyTrack.artists.map((artist: any) => artist.name),
        }
  
        const correspondingColaborecaTrack = colaborecaQueue.find(
          (colaborecaTrack: any) => colaborecaTrack.musicURI === spotifyTrack.uri
        );
        
        if (correspondingColaborecaTrack) {
          // Se encontrar correspondência, adicionar informações do DJ
          return {
            addedBy: djs.find((dj: any) => dj.id === correspondingColaborecaTrack.djId)?.djName,
            characterPath: djs.find((dj: any) => dj.id === correspondingColaborecaTrack.djId)?.characterPath,
            ...responseTrack
          };
        } else {
          // Caso contrário, a música foi adicionada pelo dono da pista
          return {
            addedBy: track.trackName,
            characterPath: null,
            ...responseTrack
          };
        }
      });
  
      await transaction.commit();
      return { status: 'OK', data: completeQueue };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async addTrackToQueue(trackId: string, musicURI: string, authorization: string) {
    const transaction = await this.sequelize.transaction();

    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);
      if (typeof decoded === 'string') {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const [dj, track] = await Promise.all([
        this.djModel.findOne({ id: decoded.id }, transaction),
        this.trackModel.findOne({ id: Number(trackId) }, { transaction })
      ]);
      if (!dj || !track) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'DJ or Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);

      const currentQueue = await SpotifyActions.getQueue(spotifyToken);
      const currentQueueURIs = currentQueue?.queue?.map((track: Track) => track.uri) ?? [];

      const isMusicAlreadyInQueue = currentQueueURIs.includes(musicURI) ||
        currentQueue.currently_playing?.uri === musicURI
      if (isMusicAlreadyInQueue) {
        await transaction.rollback();
        return { status: 'CONFLICT', data: { message: 'Music is already in queue or currently playing' } };
      }

      const response = await this.musicModel.create({
        musicURI,
        djId: dj.id as number,
        trackId: Number(trackId),
      }, { transaction });
      if (!response) {
        await transaction.rollback();
        return { status: 'Error', data: { message: 'An error occurred' } };
      }

      const addedToQueue = await SpotifyActions.addTrackToQueue(spotifyToken, musicURI);
      console.log(addedToQueue);
      
      if (!addedToQueue) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Player command failed: No active device found' } };
      }

      await transaction.commit();

      return { status: 'OK', data: response };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }
}