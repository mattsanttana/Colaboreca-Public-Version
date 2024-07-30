import { Identifiable } from '..';

export interface ITrack extends Identifiable {
  trackName: string;
  spotifyToken: string;
  createdAt: Date;
  updatedAt: Date;
}