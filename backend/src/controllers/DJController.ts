import { Request, Response } from 'express';
import DJService from '../services/DJService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

export default class DJController {
  constructor(private djService: DJService = new DJService()) { }

  async createDJ(req: Request, res: Response) {
    const data = req.body;
    const response = await this.djService.createDJ(data);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findAllDJsForTrack(req: Request, res: Response) {
    const { trackId } = req.params;
    const response = await this.djService.findAllDJsForTrack(Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findDJById(req: Request, res: Response) {
    const { djId, trackId } = req.params;
    const response = await this.djService.findDJById(Number(djId), Number(trackId));
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async findDJByToken(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.djService.findDJByToken(authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async verifyIfDjHasAlreadyBeenCreatedForThisTrack(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.djService.verifyIfDjHasAlreadyBeenCreatedForThisTrack(authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async verifyIfTheDJIsTheProfileOwner(req: Request, res: Response) {
    const { id } = req.params;
    const authorization = req.headers.authorization;
    const response = await this.djService.verifyIfTheDJIsTheProfileOwner(Number(id), authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async updateDJ(req: Request, res: Response) {
    const { characterPath, djName } = req.body;
    const authorization = req.headers.authorization;
    const response = await this.djService.updateDJ(characterPath, djName, authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async deleteDJ(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    const response = await this.djService.deleteDJ(authorization as string);
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}