import { Identifiable } from "..";

export interface IMusic extends Identifiable {
  cover: string;
  name: string;
  artists: string;
  musicURI: string;
  djId: number;
  trackId: number;
  pointsApllied: boolean;
}