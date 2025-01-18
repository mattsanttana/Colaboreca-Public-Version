import { Op, Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import TrackModel from '../models/TrackModel';
import DJModel from '../models/DJModel';
import ChatModel from '../models/ChatModel';
import MessageModel from '../models/MessageModel';
import MusicModel from '../models/MusicModel';
import VoteModel from '../models/VoteModel';
import { getSocket } from '../utils/socketIO';
import generateShortId from '../utils/generateShortId';
import SpotifyActions from '../utils/SpotifyActions';
import JWT from '../utils/JWT';

export default class TrackService {
  constructor(
    private sequelize: Sequelize = new Sequelize(config),
    private trackModel: TrackModel = new TrackModel(),
    private djModel: DJModel = new DJModel(),
    private chatModel: ChatModel = new ChatModel(),
    private messageModel: MessageModel = new MessageModel(),
    private musicModel: MusicModel = new MusicModel(),
    private voteModel: VoteModel = new VoteModel()
  ) { }

  async createTrack(data: { trackName: string, code: string }) {
    const { trackName, code } = data;
    const transaction = await this.sequelize.transaction();

    try {
      let id = generateShortId();

      if (!id) {
        throw new Error('Error generating ID');
      }

      const spotifyToken = await SpotifyActions.getAccessToken(code);

      if (!spotifyToken) {
        throw new Error('Invalid access code');
      }

      const validToken = await SpotifyActions.refreshAccessToken(spotifyToken);

      const isPremium = await SpotifyActions.getCurrentUser(validToken);

      if (isPremium.product !== 'premium') {
        throw new Error('You need to have a Spotify Premium account');
      }

      await this.deleteAllTracksWithSixHoursAbsence();

      let trackWithId = await this.trackModel.findOne({ id });
      while (trackWithId || id.toString().length !== 6) {
        id = generateShortId();
        trackWithId = await this.trackModel.findOne({ id });
      }

      const track = await this.trackModel.create(id, trackName, spotifyToken, { transaction });

      const token = JWT.sign({ id: track.id });

      await transaction.commit();

      return { status: 'CREATED', data: { id, trackName, token } };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  async findTrackById(id: number) {
    try {
      const response = await this.trackModel.findOne({ id });

      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      return { status: 'OK', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async verifyIfTrackAlreadyBeenCreated(authorization: string) {
    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: decoded.id });

      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      return { status: 'OK', data: track.id };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async verifyTrackAccess(id: number, authorization: string) {
    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      if (decoded.id !== id) {
        return { status: 'UNAUTHORIZED', data: { message: 'Unauthorized' } };
      }

      return { status: 'OK', data: { message: 'Authorized' } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async updateTrack(trackName: string, authorization: string) {
    const transaction = await this.sequelize.transaction();
    const io = getSocket();

    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: decoded.id });

      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const now = new Date();

      const updatedFields: Partial<{ trackName: string, updatedAt: Date }> = {};
      if (trackName !== undefined && trackName !== track.trackName) {
        updatedFields['trackName'] = trackName;
        updatedFields['updatedAt'] = now;
      }

      if (Object.keys(updatedFields).length === 0) {
        return { status: 'INVALID_DATA', data: { message: 'No fields updated' } };
      }

      const response = await this.trackModel.update(updatedFields as { trackName: string, updatedAt: Date }, { id: decoded.id }, { transaction });

      if (response[0] === 0) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      await transaction.commit();

      const trackUpdated = await this.trackModel.findOne({ id: decoded.id });

      io.to(`track_${decoded.id}`).emit('track updated', { trackName: trackUpdated?.trackName });

      return { status: 'OK', data: { message: 'Track updated' } };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  async deleteTrack(authorization: string) {
    const transaction = await this.sequelize.transaction();
    const io = getSocket();

    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: decoded.id });

      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      await Promise.all([
        this.chatModel.delete({ trackId: decoded.id }, transaction),
        this.djModel.delete({ trackId: decoded.id }, transaction),
        this.messageModel.delete({ trackId: decoded.id }, transaction),
        this.musicModel.delete({ trackId: decoded.id }, transaction),
        this.voteModel.delete({ trackId: decoded.id }, transaction)
      ]);

      await this.trackModel.delete({ where: { id: decoded.id } }, { transaction });

      await transaction.commit();

      io.to(`track_${decoded.id}`).emit('track deleted', { trackId: decoded.id });

      return { status: 'OK', data: { message: 'Track deleted' } };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  async deleteAllTracksWithSixHoursAbsence() {
    const io = getSocket();
    const transaction = await this.sequelize.transaction();
    try {
      const tracksToDelete = await this.trackModel.findAll({
        where: {
          updatedAt: {
            [Op.lt]: new Date(new Date().getTime() - 1000 * 60 * 60 * 6)
          }
        },
        transaction
      });

      for (const track of tracksToDelete) {
        const trackId = track.id;

        // Deletar entradas relacionadas nas tabelas Chat, DJ, Message, Music e Vote
        await Promise.all([
          this.chatModel.delete({ where: { trackId }, transaction }),
          this.djModel.delete({ where: { trackId }, transaction }),
          this.messageModel.delete({ where: { trackId }, transaction }),
          this.musicModel.delete({ where: { trackId }, transaction }),
          this.voteModel.delete({ where: { trackId }, transaction })
        ]);

        // Deletar a track
        await this.trackModel.delete({ where: { id: trackId }, transaction });
        io.to(`track_${trackId}`).emit('track deleted', { trackId });
      }

      await transaction.commit();
      return { status: 'OK', data: { message: `${tracksToDelete.length} tracks deleted` } };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async deleteDJ(id: number, authorization: string) {
    const transaction = await this.sequelize.transaction();
    const io = getSocket();

    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id, trackId: decoded.id });

      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      const response = await this.djModel.delete({ id }, { transaction });

      if (response === 0) {
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      const now = new Date();

      await this.trackModel.update({ updatedAt: now }, { id: decoded.id }, { transaction });

      await transaction.commit();

      io.to(`track_${decoded.id}`).emit('dj deleted', { id });

      return { status: 'OK', data: { message: 'DJ deleted' } };
    } catch (error) {
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
