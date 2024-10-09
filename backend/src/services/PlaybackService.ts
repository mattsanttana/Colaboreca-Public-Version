import { InferAttributes, Sequelize } from 'sequelize';
import MusicModel from '../models/MusicModel';
import TrackModel from '../models/TrackModel';
import DJModel from '../models/DJModel';
import SpotifyActions from '../utils/SpotifyActions';
import JWT from '../utils/JWT';
import { Track } from '../interfaces/spotify_response/SpotifyResponse';
import * as config from '../database/config/database';
import SequelizeMusic from '../database/models/SequelizeMusic';

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
      const colaborecaQueue = await this.musicModel.findAll({ trackId: Number(trackId) }, { transaction });

      if (!spotifyQueue || !colaborecaQueue) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      // Construir a fila completa associando DJs e músicas do Spotify
      const completeQueue = spotifyQueue.queue.map((spotifyTrack: any) => {
        const responseTrack = {
          cover: spotifyTrack.album.images[0].url,
          musicName: spotifyTrack.name,
          artists: spotifyTrack.artists.map((artist: any) => artist.name).join(', '),
        }

        const correspondingColaborecaTrack = colaborecaQueue.find(
          (colaborecaTrack: any) => colaborecaTrack.musicURI === spotifyTrack.uri
        );

        if (correspondingColaborecaTrack) {
          // Se encontrar correspondência, adicionar informações do DJ
          return {
            djId: correspondingColaborecaTrack.djId,
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

  async findSpotifyQueue(trackId: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const track = await this.trackModel.findOne({ id: Number(trackId) }, { transaction });

      if (!track) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);

      const response = await SpotifyActions.getQueue(spotifyToken);

      if (!response) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      await transaction.commit();
      return { status: 'OK', data: response.queue };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findAddedMusicsByDJ(djId: string, trackId: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const track = await this.trackModel.findOne({ id: Number(trackId) }, { transaction });
      const dj = await this.djModel.findOne({ id: Number(djId) }, { transaction });

      if (!track || !dj) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'DJ or Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);
      const spotifyQueue = await SpotifyActions.getQueue(spotifyToken);
      const colaborecaQueue = await this.musicModel.findAll({ djId: Number(djId), trackId: Number(trackId) }, { transaction });

      if (!spotifyQueue || !colaborecaQueue) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const completeQueue = colaborecaQueue.map((colaborecaTrack: any) => {
        const spotifyTrack = spotifyQueue.queue.find((spotifyTrack: any) => spotifyTrack.uri === colaborecaTrack.musicURI);
        const trackWasPlayed = !spotifyTrack; // Se a música não estiver na fila, ela foi tocada

        return {
          cover: colaborecaTrack.cover, // usar a capa do colaboreca se não estiver na fila
          name: colaborecaTrack.name, // usar o nome da música do colaboreca se não estiver na fila
          artists: colaborecaTrack.artists,
          wasPlayed: trackWasPlayed, // flag indicando se a música foi tocada
        };
      });

      await transaction.commit();
      return { status: 'OK', data: completeQueue };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }


  async findDJAddedCurrentMusic(trackId: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const track = await this.trackModel.findOne({ id: Number(trackId) }, { transaction });
      const djs = await this.djModel.findAll({ trackId: Number(trackId) }, { transaction });

      if (!track || !djs) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Track or DJs not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);
      const spotifyQueue = await SpotifyActions.getQueue(spotifyToken);
      const colaborecaQueue = await this.musicModel.findAll({ trackId: Number(trackId) }, { transaction });

      if (!spotifyQueue || !colaborecaQueue) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const currentlyPlayingTrack = spotifyQueue.currently_playing;

      if (!currentlyPlayingTrack) {
        await transaction.commit();
        return { status: 'NOT_FOUND', data: { message: 'No track currently playing' } };
      }

      const colaborecaTracksWithURI = colaborecaQueue.filter(
        (colaborecaTrack: any) => colaborecaTrack.musicURI === currentlyPlayingTrack.uri
      );

      let addedBy;
      let characterPath;

      if (colaborecaTracksWithURI.length > 0) {
        // Verificar se todas as ocorrências são do Spotify ou se há alguma do DJ
        const isAllSpotify = colaborecaTracksWithURI.every(
          (colaborecaTrack: any) => colaborecaTrack.djId === null
        );

        if (isAllSpotify) {
          // Se todas as ocorrências são do Spotify, então consideramos que a música foi adicionada pelo Spotify
          addedBy = track.trackName;
          characterPath = null;
        } else {
          // Se houver pelo menos uma ocorrência do DJ, considerar a última como a que adicionou a música
          const lastColaborecaTrack = colaborecaTracksWithURI.reduce((latest, current) => {
            if (latest.id === undefined || (current.id !== undefined && current.id > latest.id)) {
              return current;
            }
            return latest;
          }, {} as InferAttributes<SequelizeMusic, { omit: never; }>); // Inicializa com um objeto vazio do tipo correto

          const dj = djs.find((dj: any) => dj.id === lastColaborecaTrack.djId);

          if (dj) {
            addedBy = dj.djName;
            characterPath = dj.characterPath;
          } else {
            addedBy = track.trackName;
            characterPath = null;
          }
        }
      } else {
        addedBy = track.trackName;
        characterPath = null;
      }

      await transaction.commit();
      return {
        status: 'OK',
        data: {
          musicId: colaborecaQueue.find((colaborecaTrack: any) => colaborecaTrack.musicURI === currentlyPlayingTrack.uri)?.id,
          cover: currentlyPlayingTrack.album.images[0].url,
          musicName: currentlyPlayingTrack.name,
          artists: currentlyPlayingTrack.artists.map((artist: any) => artist.name),
          addedBy,
          characterPath,
        },
      };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async addTrackToQueue(
    trackId: string,
    musicData: { cover: string, name: string, artists: string, musicURI: string },
    authorization: string
  ) {
    const transaction = await this.sequelize.transaction();
    const { cover, name, artists, musicURI } = musicData;

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
        cover,
        name,
        artists,
        musicURI,
        djId: dj.id as number,
        trackId: Number(trackId),
      }, { transaction });
      if (!response) {
        await transaction.rollback();
        return { status: 'Error', data: { message: 'An error occurred' } };
      }

      const addedToQueue = await SpotifyActions.addTrackToQueue(spotifyToken, musicURI);

      if (!addedToQueue) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'Player command failed: No active device found' } };
      }

      await this.trackModel.update({ updatedAt: new Date() }, { id: Number(trackId) }, { transaction });

      await transaction.commit();

      return { status: 'OK', data: response };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }
}