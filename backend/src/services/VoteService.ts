import JWT from '../utils/JWT';
import PlaybackService from './PlaybackService';
import DJModel from '../models/DJModel';
import VoteModel from '../models/VoteModel';

export default class VoteService {
  constructor(
    private playbackService: PlaybackService = new PlaybackService(),
    private voteModel: VoteModel = new VoteModel(),
    private djModel: DJModel = new DJModel()
  ) { }

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
}