import { Response, Request } from 'express';
import TrackService from '../services/TrackService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

export default class TrackController {
  constructor(private trackService: TrackService = new TrackService()) {}

  async createTrack(req: Request, res: Response) {
    const data = req.body;
    const response = await this.trackService.createTrack(data);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findTrackById(req: Request, res: Response) {
    const { id } = req.params;
    const response = await this.trackService.findTrackById(Number(id));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async loginWithSpotify(req: Request, res: Response) {
    const data = {
      clientId: process.env.COLABORECA_API_CLIENT_ID,
      scopes: `user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-playback-position user-read-recently-played user-read-recently-played`,
      redirectURI: 'http://localhost:5173/login'
    }
    
    const URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${data.clientId}&scope=${encodeURIComponent(data.scopes)}&redirect_uri=${encodeURIComponent(data.redirectURI)}`
    
    res.redirect(URL);
  }

  async enterTrack(req: Request, res: Response) {
    const { id } = req.params;
    const response = await this.trackService.findTrackById(Number(id));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async verifyIfTrackAlreadyBeenCreated(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.trackService.verifyIfTrackAlreadyBeenCreated(authorization);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async deleteTrack(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.trackService.deleteTrack(authorization);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async deleteDJ(req: Request, res: Response) {
    const { id } = req.params;
    const authorization = req.headers.authorization;
    const response = await this.trackService.deleteDJ(Number(id), authorization);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}