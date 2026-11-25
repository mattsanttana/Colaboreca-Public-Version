import { Message } from "../types/Chat";

const useMessage = () => {
  const sendMessage = async (djId: number | null, message: string, messageToReply: Message | null, token: string) => {
    try {
      const response = await fetch('http://localhost:3001/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify({
          djId,
          message,
          messageToReply
        }),
      });

      const data = await response.json();

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(error);
    }
  }  

  const toggleMessageReaction = async (
    messageId: number,
    emoji: string,
    token: string
  ) => {
    try {
      const response = await fetch('http://localhost:3001/chats/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId, emoji }),
      });

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error("Error toggling message reaction:", error);
      return undefined;
    }
  };

  const editMessage = async (
    messageId: number,
    message: string,
    token: string
  ) => {
    try {
      const response = await fetch(`http://localhost:3001/chats/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      return { status: response.status, data: await response.json() };
    } catch (error) {
      console.error("Error editing message:", error);
      return undefined;
    }
  };

  const deleteMessage = async (messageId: number, token: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/moderation/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { status: response.status, data: await response.json() };
    } catch (error) {
      console.error("Error deleting message:", error);
      return undefined;
    }
  };

  const setModerator = async (
    djId: number,
    enabled: boolean,
    token: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3001/moderation/djs/${djId}/moderator`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled }),
        }
      );
      return { status: response.status, data: await response.json() };
    } catch (error) {
      console.error("Error changing DJ moderator role:", error);
      return undefined;
    }
  };

  const timeoutDJ = async (
    djId: number,
    type: "chat" | "queue",
    durationMs: number,
    token: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3001/moderation/djs/${djId}/timeout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type, durationMs }),
        }
      );
      return { status: response.status, data: await response.json() };
    } catch (error) {
      console.error("Error applying DJ timeout:", error);
      return undefined;
    }
  };

  const removeTimeoutDJ = async (
    djId: number,
    type: "chat" | "queue",
    token: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3001/moderation/djs/${djId}/timeout`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type }),
        }
      );
      return { status: response.status, data: await response.json() };
    } catch (error) {
      console.error("Error removing DJ timeout:", error);
      return undefined;
    }
  };

  const getAllMessagesForThisDJ = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
      });

      const data = await response.json();

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(error);
    }
  }

  const markMessagesAsRead = async (messageIds: (number)[], token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/chats/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify({ messageIds }), // Envia os IDs das mensagens no corpo da requisição
      });
      
      const data = await response.json();
  
      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        status: 'ERROR',
        data: { message: 'An error occurred' },
      };
    }
  };

  const markMessageReactionsAsRead = async (
    messageIds: number[],
    token: string
  ) => {
    try {
      const response = await fetch("http://localhost:3001/chats/reactions/read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageIds }),
      });

      return { status: response.status, data: await response.json() };
    } catch (error) {
      console.error("Error marking message reactions as read:", error);
      return undefined;
    }
  };

  return {
    sendMessage,
    toggleMessageReaction,
    editMessage,
    deleteMessage,
    setModerator,
    timeoutDJ,
    removeTimeoutDJ,
    getAllMessagesForThisDJ,
    markMessagesAsRead,
    markMessageReactionsAsRead
  };
}

export default useMessage;