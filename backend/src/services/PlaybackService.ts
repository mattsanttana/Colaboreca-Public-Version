import JWT from '../utils/JWT';
import TrackModel from '../models/TrackModel';
import SpotifyActions from '../utils/SpotifyActions';

export default class PlaybackService {
  constructor(private trackModel: TrackModel = new TrackModel()) { }

  async findPlaybackState(id: number) {
    try {
      const track = await this.trackModel.findOne({ id });

      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const token = await SpotifyActions.refreshAccessToken(track.spotifyToken);

      if (!token) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      const response = await SpotifyActions.getPlaybackState(token);

      if (!response) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      return { status: 'OK', data: response.data };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findTopTracksInBrazil(trackId: string) {
    try {
      const track = await this.trackModel.findOne({ id: Number(trackId) });

      if (!track) {
        return { status: 'NOT_FOUND', data: { message: 'Track not found' } };
      }

      const spotifyToken = await SpotifyActions.refreshAccessToken(track.spotifyToken);

      const response = await SpotifyActions.getTopTracksInBrazil(spotifyToken);

      if (!response) {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid Spotify token' } };
      }

      return { status: 'OK', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }
}