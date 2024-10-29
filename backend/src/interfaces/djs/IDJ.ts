import { Identifiable } from '..';

export interface IDJ extends Identifiable {
  djName: string;
  characterPath: string;
  score: number;
  ranking: number;
  trackId: number;
}