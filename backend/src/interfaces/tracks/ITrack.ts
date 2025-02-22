import { Identifiable } from '..';
import { IDJ } from '../djs/IDJ';
import { IMusic } from '../musics/IMusic';

export interface ITrack extends Identifiable {
  trackName: string;
  spotifyToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrackQueueData {
  id: number;
  trackName: string;
  spotifyToken: string;
  createdAt: Date;
  updatedAt: Date;
  djs: IDJ[];
  colaborecaQueue: IMusic[];
}