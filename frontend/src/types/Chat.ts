export type Message = {
  id: number
  djId: number;
  receiveDJId: number;
  message: string;
  chatId?: string;
  createdAt: Date;
  read: boolean;
  isReply: boolean;
  replyTo: number;
}

export type Chats = {
  [key: string]: Message[];
}