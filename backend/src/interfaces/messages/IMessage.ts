import { Identifiable } from "..";

export interface IMessage extends Identifiable {
  chatId?: number | null;
  trackId: number;
  djId: number;
  receiveDJId?: number;
  message: string;
  createdAt: Date;
  read: boolean;
  isReply?: boolean;
  replyTo?: number;
}