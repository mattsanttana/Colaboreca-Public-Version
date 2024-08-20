import { Identifiable } from "..";

export interface IVote extends Identifiable {
  voterId: number;
  veryGood: number;
  good: number;
  normal: number;
  bad: number;
  veryBad: number;
  musicId: number;
}