export type ChatMessage = {
  id: number
  djId: string;
  receiveDJId: string;
  message: string;
  chatId?: string;
  createdAt: Date;
  read: boolean;
}

export type Chats = {
  [key: string]: ChatMessage[];
}