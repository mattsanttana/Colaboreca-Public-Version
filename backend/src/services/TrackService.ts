import { Op } from 'sequelize';
import TrackModel from '../models/TrackModel';
import DJModel from '../models/DJModel';
import generateShortId from '../utils/generateShortId';
import SpotifyActions from '../utils/SpotifyActions';
import JWT from '../utils/JWT';

export default class TrackService {
  constructor(
    private trackModel: TrackModel = new TrackModel(),
    private djModel: DJModel = new DJModel()
  ) {}

  async createTrack(data: { trackName: string, code: string }) {
    try {
      const { trackName, code } = data;  

      if (!trackName || !code) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters' } };
      }

      let id = generateShortId();

      if (!id) {
        return { status: 'ERROR', data: { message: 'Error generating ID' } };
      }

      const spotifyToken = await SpotifyActions.getAccessToken(code);

      if (!spotifyToken) {
        return { status: 'INVALID_DATA', data: { message: 'invalid access code' } };
      }

      const validToken = await SpotifyActions.refreshAccessToken(spotifyToken);

      const isPremium = await SpotifyActions.getCurrentUser(validToken);

      if (isPremium.product !== 'premium') {
        return { status: 'UNAUTHORIZED', data: { message: 'You need to have a Spotify Premium account' } };
      }

      await this.trackModel.delete({
        where: {
          createdAt: {
            [Op.lt]: new Date(new Date().getTime() - 12 * 60 * 60 * 1000),
          },
        }
      });
      
      let trackWithId = await this.trackModel.findOne({ id });
      while (trackWithId || id.toString().length !== 6){
        id = generateShortId();
        trackWithId = await this.trackModel.findOne({ id });
      }
      
      const track = await this.trackModel.create(id, trackName, spotifyToken);
    
      const token = JWT.sign({ id: track.id});

      const response = { id, trackName, token }

      return { status: 'CREATED', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findTrackById(id: number) {
    try {
      if (!id) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters' } };
      }

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

  async verifyIfTrackAlreadyBeenCreated(authorization: string | undefined) {
    try {
      if (!authorization) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters' } };
      }
      
      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if(typeof decoded === 'string') {
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

  async deleteTrack(authorization: string | undefined) {
    try {
      if (!authorization) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters' } };
      }

      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if(typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const track = await this.trackModel.findOne({ id: decoded.id });

      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      await this.trackModel.delete({ where: { id: decoded.id } });

      return { status: 'OK', data: { message: 'Track deleted' } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async deleteDJ(id: number, authorization: string | undefined) {
    try {
      if (!id || !authorization) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters' } };
      }

      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if(typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id, trackId: decoded.id });

      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      const response = await this.djModel.delete({ where: { id } });

      if (response === 0) {
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      const now = new Date();

      await this.trackModel.update({ updatedAt: now }, { where: { id: decoded.id } });

      return { status: 'OK', data: { message: 'DJ deleted' } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }
}