import { DJ } from './DJ';

export type MessageReaction = {
  djId: number;
  emoji: string;
  createdAt?: string | Date;
  read?: boolean;
};

export type Message = {
  id: number
  djId: number;
  receiveDJId: number;
  message: string;
  previousMessage?: string | null;
  editedAt?: string | Date | null;
  chatId?: string;
  createdAt: Date;
  read: boolean;
  isReply: boolean;
  replyTo: number;
  dj?: DJ;
  receiveDJ?: DJ;
  reactions?: MessageReaction[];
  deletedAt?: string | null;
  deletedByDJId?: number | null;
  deletedByModeration?: boolean;
}

export type Chats = {
  [key: string]: Message[];
}
