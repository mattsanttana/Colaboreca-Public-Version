import { Identifiable } from "..";
import { IDJ } from "../djs/IDJ";
import { IVote } from "../votes/IVote";

// Interface do modelo de música
export interface IMusic extends Identifiable {
  cover: string; // Capa da música
  name: string; // Nome da música
  artists: string; // Artistas da música
  musicURI: string; // URI da música
  djId: number; // ID do DJ
  trackId: number; // ID da pista
  pointsApllied: boolean; // Pontos aplicados
}

// Interface de retorno da música com o DJ que adicionou e os votos recebidos
export interface IMusicWithDJAndVotes extends IMusic {
  votes: IVote[]; // Votos recebidos
  dj: IDJ; // DJ que adicionou a música
}
