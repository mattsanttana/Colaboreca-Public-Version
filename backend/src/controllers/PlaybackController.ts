import { Response, Request } from 'express';
import PlaybackService from '../services/PlaybackService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

export default class TrackController {
  constructor(private playbackService: PlaybackService = new PlaybackService()) { }

  async findPlaybackState(req: Request, res: Response) {
    const { trackId } = req.params;
    const response = await this.playbackService.findPlaybackState(Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findTopTracksInBrazil(req: Request, res: Response) {
    const { trackId } = req.params;
    const response = await this.playbackService.findTopTracksInBrazil(trackId);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}