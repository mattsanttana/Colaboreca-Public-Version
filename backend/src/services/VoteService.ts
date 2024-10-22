import { Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import PlaybackService from './PlaybackService';
import DJModel from '../models/DJModel';
import VoteModel from '../models/VoteModel';
import MusicModel from '../models/MusicModel';
import JWT from '../utils/JWT';
import { Vote } from '../interfaces/votes/IVote';

export default class VoteService {
  constructor(
    private sequelize: Sequelize = new Sequelize(config),
    private playbackService: PlaybackService = new PlaybackService(),
    private voteModel: VoteModel = new VoteModel(),
    private djModel: DJModel = new DJModel(),
    private musicModel: MusicModel = new MusicModel()
  ) { }

  async createVote(authorization: string, musicURI: string, vote: Vote) {
    const transaction = await this.sequelize.transaction();
    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);
  
      if (typeof decoded === 'string') {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }
  
      const music = await this.musicModel.findOne({ musicURI }, transaction);
  
      if (!music || !music.id || music.djId === decoded.id) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Music not found or invalid dj' } };
      }
  
      const response = await this.voteModel.create({ djId: decoded.id, musicId: music.id, vote }, { transaction });
  
      await transaction.commit();
      return { status: 'OK', data: response };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async verifyIfDJHasAlreadVoted(authorization: string) {
    try {
      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id });

      const music = await this.playbackService.findDJAddedCurrentMusic(decoded.trackId);

      if (!music.data.musicId || music.data.addedBy === dj?.djName) {
        return {
          status: 'OK',
          data: { message: 'The song was added for currently DJ, or was not added by track DJ' } };
      }

      const response = await this.voteModel.findOne({ djId: decoded.id, musicId: music.data.musicId });

      if (!response) {
        return { status: 'OK', data: { message: 'The DJ has not yet voted on the current song' }};
      } 

      return { status: 'OK', data: { message: 'The DJ has already voted' }};
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async getAllVotesForThisMusic(trackId: string, musicURI: string) {
    try {
      const music = await this.musicModel.findOne({ musicURI });

      if (!music || !music.id) {
        return { status: 'OK', data: { message: 'Music not found' } };
      }

      const votes = await this.voteModel.findAll({ musicId: music.id });

      const voteValues = votes.map(vote => vote.vote);

      return { status: 'OK', data: { voteValues } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }
}