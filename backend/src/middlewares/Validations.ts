import { Request, Response, NextFunction } from 'express';
import JWT from '../utils/JWT';
import { JwtPayload } from 'jsonwebtoken';
import { trackNameSchema, djNameSchema } from '../utils/schemas';
import SequelizeTrack from '../database/models/SequelizeTrack';

export default class Validations {
  static async validateToken(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ message: 'Token not found' });
    }

    const token = authorization.replace('Bearer ', '');

    try {
      const payload = JWT.verify(token) as JwtPayload;

      if (typeof payload === 'string') {
        return res.status(401).json({ message: 'Invalid token' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  static async validateCreateDJ(req: Request, res: Response, next: NextFunction) {
    const { djName, trackId, characterPath } = req.body;

    if (!djName || !trackId || !characterPath) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const { error } = djNameSchema.validate({ djName });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const track = await SequelizeTrack.findOne({ where: { id: trackId } });

    if (!track) {
      return res.status(401).json({ message: 'This track does not exist' });
    }

    next();
  }

  static async validateTrackId(req: Request, res: Response, next: NextFunction) {
    const { trackId } = req.params;

    if (!trackId || isNaN(Number(trackId))) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateDJId(req: Request, res: Response, next: NextFunction) {
    const { djId } = req.params;

    if (!djId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateUpdateDJ(req: Request, res: Response, next: NextFunction) {
    const { djName, characterPath } = req.body;

    if (!djName && !characterPath) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    if (djName) {
      const { error } = djNameSchema.validate({ djName });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    next();
  }

  static async validateCreateTrack(req: Request, res: Response, next: NextFunction) {
    const { trackName, code } = req.body;

    if (!trackName || !code) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const { error } = trackNameSchema.validate({ trackName });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    next();
  }

  static async validateTrackName(req: Request, res: Response, next: NextFunction) {
    const { trackName } = req.body;

    if (!trackName) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const { error } = trackNameSchema.validate({ trackName });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    next();
  }

  static async validateSearchQuery(req: Request, res: Response, next: NextFunction) {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateCreateMusic(req: Request, res: Response, next: NextFunction) {
    const { cover, name, artists, musicURI } = req.body;

    if (!cover || !name || !artists || !musicURI) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateCreateVote(req: Request, res: Response, next: NextFunction) {
    const { musicURI, vote } = req.body;

    if (!musicURI || !vote) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateMusicURI(req: Request, res: Response, next: NextFunction) {
    const { musicURI } = req.params;

    if (!musicURI) {
      return res.status(201).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateSendMessage(req: Request, res: Response, next: NextFunction) {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }

  static async validateMessagesIds(req: Request, res: Response, next: NextFunction) {
    const { messageIds } = req.body;

    if (!messageIds) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next();
  }
}