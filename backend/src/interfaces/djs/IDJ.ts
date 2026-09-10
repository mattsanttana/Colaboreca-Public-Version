import { Identifiable } from '..';

// Interface do modelo de DJ
export interface IDJ extends Identifiable {
  djName: string; // Nome do DJ
  characterPath: string; // Caminho da imagem do personagem
  score: number; // Pontuação do DJ
  ranking: number; // Ranking do DJ
  isOwner: boolean; // Indica se o DJ é o dono da pista
  trackId: number; // ID da pista
}