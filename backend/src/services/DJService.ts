import { UniqueConstraintError } from 'sequelize';
import JWT from '../utils/JWT';
import DJModel from '../models/DJModel';
import TrackModel from '../models/TrackModel';

export default class DJService {
  private trackModel = new TrackModel();
  private djModel = new DJModel();

  async createDJ(data: { djName: string, characterPath: string, trackId: number }) {
    try {
      const { djName, trackId, characterPath } = data;

      if (!djName || !trackId || !characterPath) {
        return { status: 'INVALID_DATA', data: { message: 'This track does not exist' }};
      }
      
      const track = await this.trackModel.findOne({ id: trackId }); 
      
      if (!track) {
        return { status: 'UNAUTHORIZED', data: { message: 'This track does not exist'}};
      }
    
      const dj = await this.djModel.create(djName, characterPath, trackId);

      const token = JWT.sign({ id: dj.id, trackId});

      const response = { ...dj, token };

      const now = new Date();

      this.trackModel.update({ updatedAt: now }, { id: trackId });

      return { status: 'CREATED', data: response };
    } catch (error) {
      console.error(error);
      if(error instanceof UniqueConstraintError) {
        return { status: 'CONFLICT', data: { message: 'DJ already exists'}};
      }
      return { status: 'ERROR', data: { message: 'An error occurred'}};
    }
  }
  
  async findAllDJsForTrack(trackId: number) {
    try {
      if (!trackId) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters'}};
      }
      
      const response = await this.djModel.findAll({ trackId });
      
      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found'}};
      }

      return { status: 'OK', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred'}};
    }
  }

  async findDJById(djId: number, trackId: number) {
    try {
      if (!djId || !trackId) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters'}};
      }

      const response = await this.djModel.findOne({ id: djId, trackId });
      
      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found'}};
      }

      return { status: 'OK', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred'}};
    }
  }

  async findDJByToken(authorization: string | undefined) {
    try {
      if (!authorization) {
        return { status: 'UNAUTHORIZED', data: { message: 'Missing authorization' }};
      }

      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' }};
      }

      const response = await this.djModel.findOne({ id: decoded.id, trackId: decoded.trackId });

      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' }};
      }

      return { status: 'OK', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' }};
    }
  }

  async verifyIfDjHasAlreadyBeenCreatedForThisTrack(authorization: string | undefined) {
    try {
      if (!authorization) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters' }};
      }

      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' }};
      }

      const dj = await this.djModel.findOne({ id: decoded.id, trackId: decoded.trackId});
      
      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' }};
      }

      return { status: 'OK', data: dj.trackId };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred'} };
    }
  }

  async verifyIfTheDJIsTheProfileOwner(id: number | undefined, authorization: string | undefined) {
    try {
      if (!id || !authorization) {
        return { status: 'INVALID_DATA', data: { message: 'Missing parameters' }};
      }

      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' }};
      }

      if (id !== decoded.id) {
        return { status: 'UNAUTHORIZED', data: { message: 'This DJ is not the owner of this profile' }};
      }

      const dj = await this.djModel.findOne({ id: decoded.id, trackId: decoded.trackId });

      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' }};
      }

      return { status: 'OK', data: { message: 'This DJ is the owner this profile' }};
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' }};
    }
  }

  async updateDJ(characterPath: string | undefined, djName: string | undefined, authorization: string | undefined) {
    try {
        if (!characterPath && !djName) {
            return { status: 'INVALID_DATA', data: { message: 'Missing parameters' }};
        }

        if (!authorization) {
            return { status: 'UNAUTHORIZED', data: { message: 'Missing authorization' }};
        }

        const token = authorization.split(' ')[1];

        const decoded = JWT.verify(token);

        if (typeof decoded === 'string') {
            return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' }};
        }

        const dj = await this.djModel.findOne({ id: decoded.id, trackId: decoded.trackId });

        if (!dj) {
            return { status: 'NOT_FOUND', data: { message: 'DJ not found' }};
        }

        const updatedFields: Partial<{ djName: string; characterPath: string }> = {};
        if (djName !== undefined && djName !== dj.djName) {
            updatedFields['djName'] = djName;
        }
        if (characterPath !== undefined && characterPath !== dj.characterPath) {
            updatedFields['characterPath'] = characterPath;
        }

        if (Object.keys(updatedFields).length === 0) {
            return { status: 'OK', data: { message: 'No fields updated' }};
        }

        const response = await this.djModel.update(updatedFields as { djName: string; characterPath: string }, { id: decoded.id });

        if (response[0] === 0) {
            return { status: 'NOT_FOUND', data: { message: 'DJ not found' }};
        }

        const now = new Date();

        this.trackModel.update({ updatedAt: now }, { id: decoded.trackId });

        return { status: 'OK', data: { message: 'DJ updated successfully' }};
    } catch (error) {
        console.error(error);
        if (error instanceof UniqueConstraintError) {
            return { status: 'CONFLICT', data: { message: 'DJ already exists'}};
        }
        return { status: 'ERROR', data: { message: 'An error occurred' }};
    }
  }

  async deleteDJ(authorization: string | undefined) {
    try {
      if (!authorization) {
        return { status: 'UNAUTHORIZED', data: { message: 'Missing authorization' }};
      }

      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' }};
      }

      const dj = await this.djModel.findOne({ id: decoded.id, trackId: decoded.trackId });

      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' }};
      }

      const response = await this.djModel.delete({ id: decoded.id });

      if (response === 0) {
        return { status: 'ERROR', data: { message: 'An error occurred' }};
      }

      const now = new Date();

      this.trackModel.update({ updatedAt: now }, { id: decoded.trackId });

      return { status: 'OK', data: { message: 'DJ deleted successfully' }};
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred'}};
    }
  }
}