import { Request, Response } from 'express';
import ModerationService from '../services/ModerationService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

export default class ModerationController {
  constructor(private moderationService: ModerationService = new ModerationService()) { }

  async setModerator(req: Request, res: Response) {
    const response = await this.moderationService.setModerator(
      Number(req.params.djId),
      req.body.enabled,
      req.headers.authorization as string
    );
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async timeoutDJ(req: Request, res: Response) {
    const response = await this.moderationService.timeoutDJ(
      Number(req.params.djId),
      req.body,
      req.headers.authorization as string
    );
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async removeTimeoutDJ(req: Request, res: Response) {
    const response = await this.moderationService.removeTimeoutDJ(
      Number(req.params.djId),
      req.body.type,
      req.headers.authorization as string
    );
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }

  async deleteMessage(req: Request, res: Response) {
    const response = await this.moderationService.deleteMessage(
      Number(req.params.messageId),
      req.headers.authorization as string
    );
    res.status(mapStatusHTTP(response.status)).json(response.data);
  }
}
