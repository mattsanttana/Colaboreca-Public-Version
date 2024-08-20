import { Identifiable } from "..";

export interface IMusic extends Identifiable {
  musicURI: string;
  djId: number;
  trackId: number;
}