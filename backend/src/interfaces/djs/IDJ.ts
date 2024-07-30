import { Identifiable } from '..';

export interface IDJ extends Identifiable {
  djName: string;
  characterPath: string;
  credits: number;
  score: number;
  ranking: number;
  trackId: number;
}