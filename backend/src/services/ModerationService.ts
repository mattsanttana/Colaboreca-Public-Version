import SequelizeDJ from '../database/models/SequelizeDJ';
import SequelizeMessage from '../database/models/SequelizeMessage';
import SequelizeTrack from '../database/models/SequelizeTrack';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';

const MAX_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;

export default class ModerationService {
  private async getActor(authorization: string) {
    const decoded = JWT.verify(authorization.split(' ')[1]);
    if (typeof decoded === 'string') return null;

    const actor = await SequelizeDJ.findOne({
      where: { id: decoded.id, trackId: decoded.trackId },
    });
    if (!actor) return null;

    const track = await SequelizeTrack.findByPk(decoded.trackId);
    if (!track) return null;

    return { actor, track };
  }

  async setModerator(djId: number, enabled: boolean, authorization: string) {
    try {
      const context = await this.getActor(authorization);
      if (!context) return { status: 'UNAUTHORIZED', data: { message: 'Invalid DJ or token' } };
      const { actor, track } = context;

      if (track.ownerDjId !== actor.id) {
        return { status: 'FORBIDDEN', data: { message: 'Only the track owner can manage moderators' } };
      }

      const target = await SequelizeDJ.findOne({
        where: { id: djId, trackId: track.id },
      });
      if (!target) return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      if (target.id === track.ownerDjId) {
        return { status: 'FORBIDDEN', data: { message: 'The track owner cannot be a moderator' } };
      }

      await target.update({ isModerator: enabled });
      const updatedDJ = target.get({ plain: true });
      getSocket().to(`track_${track.id}`).emit('dj updated', updatedDJ);
      return { status: 'OK', data: updatedDJ };
    } catch (error) {
      console.error(error);
      return {
        status: 'ERROR',
        data: { message: error instanceof Error ? error.message : 'Unknown moderation error' },
      };
    }
  }

  async timeoutDJ(
    djId: number,
    data: { type: 'chat' | 'queue'; durationMs: number },
    authorization: string
  ) {
    try {
      const context = await this.getActor(authorization);
      if (!context) return { status: 'UNAUTHORIZED', data: { message: 'Invalid DJ or token' } };
      const { actor, track } = context;
      const isOwner = track.ownerDjId === actor.id;

      if (!isOwner && !actor.isModerator) {
        return { status: 'FORBIDDEN', data: { message: 'Only moderators can timeout DJs' } };
      }

      const target = await SequelizeDJ.findOne({
        where: { id: djId, trackId: track.id },
      });
      if (!target) return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      if (target.id === track.ownerDjId || target.id === actor.id) {
        return { status: 'FORBIDDEN', data: { message: 'Cannot timeout yourself or the track owner' } };
      }
      if (!isOwner && target.isModerator) {
        return { status: 'FORBIDDEN', data: { message: 'Moderators cannot timeout other moderators' } };
      }
      if (
        !Number.isFinite(data.durationMs)
        || data.durationMs < 60_000
        || data.durationMs > MAX_TIMEOUT_MS
      ) {
        return { status: 'INVALID_DATA', data: { message: 'Timeout must be between 1 minute and 7 days' } };
      }

      const timeoutUntil = new Date(Date.now() + data.durationMs);
      const field = data.type === 'chat' ? 'chatTimeoutUntil' : 'queueTimeoutUntil';
      await target.update({ [field]: timeoutUntil });
      const updatedDJ = target.get({ plain: true });
      getSocket().to(`track_${track.id}`).emit('dj updated', updatedDJ);
      return { status: 'OK', data: { djId: target.id, type: data.type, timeoutUntil } };
    } catch (error) {
      console.error(error);
      return {
        status: 'ERROR',
        data: { message: error instanceof Error ? error.message : 'Unknown moderation error' },
      };
    }
  }

  async removeTimeoutDJ(
    djId: number,
    type: 'chat' | 'queue',
    authorization: string
  ) {
    try {
      const context = await this.getActor(authorization);
      if (!context) return { status: 'UNAUTHORIZED', data: { message: 'Invalid DJ or token' } };
      const { actor, track } = context;

      if (track.ownerDjId !== actor.id) {
        return { status: 'FORBIDDEN', data: { message: 'Only the track owner can remove timeouts' } };
      }

      const target = await SequelizeDJ.findOne({
        where: { id: djId, trackId: track.id },
      });
      if (!target) return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };

      const field = type === 'chat' ? 'chatTimeoutUntil' : 'queueTimeoutUntil';
      await target.update({ [field]: null });
      const updatedDJ = target.get({ plain: true });
      getSocket().to(`track_${track.id}`).emit('dj updated', updatedDJ);
      return { status: 'OK', data: { djId: target.id, type, timeoutUntil: null } };
    } catch (error) {
      console.error(error);
      return {
        status: 'ERROR',
        data: { message: error instanceof Error ? error.message : 'Unknown moderation error' },
      };
    }
  }

  async deleteMessage(messageId: number, authorization: string) {
    try {
      const context = await this.getActor(authorization);
      if (!context) return { status: 'UNAUTHORIZED', data: { message: 'Invalid DJ or token' } };
      const { actor, track } = context;
      const message = await SequelizeMessage.findOne({
        where: { id: messageId, trackId: track.id },
      });
      if (!message) return { status: 'NOT_FOUND', data: { message: 'Message not found' } };
      if (message.deletedAt) {
        return { status: 'CONFLICT', data: { message: 'Message has already been deleted' } };
      }

      const isOwner = track.ownerDjId === actor.id;
      const isModerator = actor.isModerator;
      const ownsMessage = message.djId === actor.id;
      const isGeneralMessage = message.chatId === null;

      if (!ownsMessage && !(isGeneralMessage && (isOwner || isModerator))) {
        return { status: 'FORBIDDEN', data: { message: 'You cannot delete this message' } };
      }

      const deletedByModeration = isGeneralMessage && (isOwner || isModerator);
      const deletedAt = new Date();
      const [updatedMessages] = await SequelizeMessage.update(
        {
          deletedAt,
          deletedByDJId: actor.id,
          deletedByModeration,
        },
        {
          where: {
            id: messageId,
            trackId: track.id,
            deletedAt: null,
          },
        }
      );
      if (updatedMessages === 0) {
        return { status: 'CONFLICT', data: { message: 'Message has already been deleted' } };
      }

      const update = {
        messageId: message.id,
        deletedAt,
        deletedByModeration,
      };
      const io = getSocket();
      if (isGeneralMessage) {
        io.to(`general_${track.id}`).emit('chat message deleted', update);
      } else {
        io.to(`user_${message.djId}`)
          .to(`user_${message.receiveDJId}`)
          .emit('chat message deleted', update);
      }

      return { status: 'OK', data: update };
    } catch (error) {
      console.error(error);
      return {
        status: 'ERROR',
        data: { message: error instanceof Error ? error.message : 'Unknown moderation error' },
      };
    }
  }
}
