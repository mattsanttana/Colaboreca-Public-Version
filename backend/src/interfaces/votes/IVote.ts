import { Identifiable } from "..";

export type Vote = 'very_good' | 'good' | 'normal' | 'bad' | 'very_bad';

export interface IVote extends Identifiable {
  djId: number;
  musicId: number;
  vote: Vote;
  trackId: number;
}