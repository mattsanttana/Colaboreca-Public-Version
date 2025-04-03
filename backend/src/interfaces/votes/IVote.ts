import { Identifiable } from "..";

export type Vote = 'very_good' | 'good' | 'normal' | 'bad' | 'very_bad'; // Tipos de votos

// Interface do modelo de voto
export interface IVote extends Identifiable {
  djId: number; // ID do DJ
  musicId: number; // ID da música
  vote: Vote; // Voto
  trackId: number; // ID da pista
}