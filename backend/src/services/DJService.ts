import { UniqueConstraintError, Sequelize, QueryTypes } from 'sequelize';
import { camelCase } from 'lodash';
import DJModel from '../models/DJModel';
import TrackModel from '../models/TrackModel';
import { getSocket } from '../utils/socketIO';
import JWT from '../utils/JWT';
import * as config from '../database/config/database';

export default class DJService {
  constructor(
    private sequelize: Sequelize = new Sequelize(config),
    private djModel: DJModel = new DJModel(),
    private trackModel: TrackModel = new TrackModel()
  ) { }

  async createDJ(data: { djName: string, characterPath: string, trackId: number }) {
    const { djName, trackId, characterPath } = data;
    const transaction = await this.sequelize.transaction();
    const io = getSocket();

    try {
      const track = await this.trackModel.findOne({ id: trackId }, { transaction });

      if (!track) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'This track does not exist' } };
      }

      const djExists = await this.djModel.findOne({ djName, trackId }, { transaction });

      if (djExists) {
        await transaction.rollback();
        return { status: 'CONFLICT', data: { message: 'DJ already exists' } };
      }

      const dj = await this.djModel.create(djName, characterPath, trackId, { transaction });

      const token = JWT.sign({ id: dj.id, trackId });

      const response = { ...dj, token };

      const now = new Date();

      await this.trackModel.update({ updatedAt: now }, { id: trackId }, transaction);

      await transaction.commit();

      io.to(`track_${trackId}`).emit('dj created', { dj });

      return { status: 'CREATED', data: response };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findDJData(authorization: string) {
    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const djId = decoded.id;

      const response = await this.djModel.findAll({ trackId: decoded.trackId });

      const dj = response.find((dj: { id?: number | undefined }) => dj.id === djId);
      const djs = response;

      return { status: 'OK', data: { dj, djs } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findAllDJsForTrack(trackId: number) {
    try {
      const response = await this.djModel.findAll({ trackId });

      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      return { status: 'OK', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async findDJById(djId: number, trackId: number) {
    try {
      const response = await this.djModel.findOne({ id: djId });

      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      return { status: 'OK', data: response };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async verifyIfTheDJIsTheProfileOwner(id: number, authorization: string) {
    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      if (id !== decoded.id) {
        return { status: 'UNAUTHORIZED', data: { message: 'This DJ is not the owner of this profile' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id });

      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      return { status: 'OK', data: { message: 'This DJ is the owner this profile' } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async updateDJ(characterPath: string, djName: string, authorization: string) {
    const transaction = await this.sequelize.transaction();
    const io = getSocket();

    try {
      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id }, transaction);

      if (!dj) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      const updatedFields: Partial<{ djName: string; characterPath: string; priority: number }> = {};
      if (djName !== undefined && djName !== dj.djName) {
        updatedFields['djName'] = djName;
      }
      if (characterPath !== undefined && characterPath !== dj.characterPath) {
        updatedFields['characterPath'] = characterPath;
      }

      if (Object.keys(updatedFields).length === 0) {
        await transaction.commit();
        return { status: 'OK', data: { message: 'No fields updated' } };
      }

      const response = await this.djModel.update(updatedFields as { djName: string; characterPath: string; priority: number }, { id: decoded.id }, transaction);

      if (response[0] === 0) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      const now = new Date();

      await this.trackModel.update({ updatedAt: now }, { id: decoded.trackId }, transaction);

      await transaction.commit();

      io.to(`track_${decoded.trackId}`).emit('dj updated', { djId: decoded.id });

      return { status: 'OK', data: { message: 'DJ updated successfully' } };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (error instanceof UniqueConstraintError) {
        return { status: 'CONFLICT', data: { message: 'DJ already exists' } };
      }
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async deleteDJ(authorization: string) {
    const transaction = await this.sequelize.transaction();
    const io = getSocket();

    try {
      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id }, transaction);

      if (!dj) {
        await transaction.rollback();
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      const response = await this.djModel.delete({ id: decoded.id }, transaction);

      if (response === 0) {
        await transaction.rollback();
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      const now = new Date();

      await this.trackModel.update({ updatedAt: now }, { id: decoded.trackId }, transaction);

      await transaction.commit();

      io.to(`track_${decoded.trackId}`).emit('dj_deleted', { djId: decoded.id });

      return { status: 'OK', data: { message: 'DJ deleted successfully' } };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }
}
