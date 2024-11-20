import { Identifiable } from "..";

export interface IMessage extends Identifiable {
  chatId?: number | null;
  djId: number;
  receiveDJId?: number;
  message: string;
  createdAt: Date;
}