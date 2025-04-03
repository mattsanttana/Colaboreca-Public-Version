import { Identifiable } from '..';
import { IDJ } from '../djs/IDJ';
import { IMusic } from '../musics/IMusic';

// Interface do modelo de pista
export interface ITrack extends Identifiable {
  trackName: string; // Nome da pista
  spotifyToken: string; // Token do Spotify
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data de atualização
}

// Interface de retorno da pista com os DJs e fila
export interface ITrackQueueData {
  id: number; // ID da pista
  trackName: string; // Nome da pista
  spotifyToken: string; // Token do Spotify
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data de atualização
  djs: IDJ[]; // DJs da pista
  colaborecaQueue: IMusic[]; // Fila de músicas
}