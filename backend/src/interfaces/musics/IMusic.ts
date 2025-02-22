import { Identifiable } from "..";
import { IDJ } from "../djs/IDJ";
import { IVote } from "../votes/IVote";

export interface IMusic extends Identifiable {
  cover: string;
  name: string;
  artists: string;
  musicURI: string;
  djId: number;
  trackId: number;
  pointsApllied: boolean;
}

export interface IMusicWithDJAndVotes extends IMusic {
  votes: IVote[];
  dj: IDJ;
}
