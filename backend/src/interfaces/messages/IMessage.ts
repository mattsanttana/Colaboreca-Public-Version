import { Identifiable } from "..";

// Interface do modelo de mensagem
export interface IMessage extends Identifiable {
  chatId?: number | null; // ID do chat
  trackId: number; // ID da pista
  djId: number; // ID do DJ
  receiveDJId?: number; // ID do DJ que recebeu a mensagem
  message: string; // Mensagem
  createdAt: Date; // Data de criação
  read: boolean; // Mensagem lida
  isReply?: boolean; // Mensagem de resposta
  replyTo?: number; // ID da mensagem respondida
}