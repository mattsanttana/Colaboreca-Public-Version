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
    const response = await this.playbackService.findTopTracksInBrazil(Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findTrackBySearch(req: Request, res: Response) {
    const { trackId } = req.params;
    const { search } = req.query;
    const response = await this.playbackService.findTrackBySearch(Number(trackId), search as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findQueue(req: Request, res: Response) {
    const { trackId } = req.params;
    const response = await this.playbackService.findQueue(Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findSpotifyQueue(req: Request, res: Response) {
    const { trackId } = req.params;
    const response = await this.playbackService.findSpotifyQueue(Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findDJAddedCurrentMusic(req: Request, res: Response) {
    const { trackId } = req.params;
    const response = await this.playbackService.findDJAddedCurrentMusic(Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findAddedMusicsByDJ(req: Request, res: Response) {
    const { djId, trackId } = req.params;
    const response = await this.playbackService.findAddedMusicsByDJ(Number(djId), Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async addTrackToQueue(req: Request, res: Response) {
    const { trackId } = req.params;
    const { cover, name, artists, musicURI } = req.body;
    const musicData = { cover, name, artists, musicURI };
    const { authorization } = req.headers;
    const response = await this.playbackService.addTrackToQueue(Number(trackId), musicData, authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}