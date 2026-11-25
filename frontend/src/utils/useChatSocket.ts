import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Chats, Message } from "../types/Chat";
import { DJ } from "../types/DJ";
import useMessage from "./useMessage";
import socket from "./socket";

type TypingStatus = {
  [key: string]: { isTyping: boolean; typingDJ: DJ | null };
};

type UnreadMessages = {
  [key: string]: number;
};

interface UseChatSocketOptions {
  token: string;
  dj: DJ | undefined;
  trackId: string | undefined;
  selectedChat: string | null;
  chats: Chats;
  setChats: Dispatch<SetStateAction<Chats>>;
  messageActions: ReturnType<typeof useMessage>;
  setInputHeight: Dispatch<SetStateAction<number>>;
}

const useChatSocket = ({
  token,
  dj,
  trackId,
  selectedChat,
  chats,
  setChats,
  messageActions,
  setInputHeight,
}: UseChatSocketOptions) => {
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({});
  const [djTyping, setDJTyping] = useState<TypingStatus>({});
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const typingTimeoutRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const djMessages = await messageActions.getAllMessagesForThisDJ(token);

        if (djMessages?.status === 200) {
          const newChats = djMessages.data.reduce(
            (acc: Chats, message: Message) => {
              const chatId = message.chatId || "general";
              acc[chatId] = [
                ...(acc[chatId] || []),
                {
                  id: message.id,
                  djId: message.djId,
                  receiveDJId: message.receiveDJId,
                  message: message.message,
                  dj: message.dj,
                  receiveDJ: message.receiveDJ,
                  createdAt: new Date(message.createdAt),
                  read: message.read,
                  isReply: message.isReply,
                  replyTo: message.replyTo,
                },
              ];
              return acc;
            },
            {} as Chats
          );

          setChats(newChats);
          setMessagesLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!messagesLoaded) return;

    const unreadCounts = Object.keys(chats).reduce((acc, chatId) => {
      if (chatId === "general") return acc;
      const unreadCount = chats[chatId].filter(
        (message) => !message.read && message.receiveDJId === dj?.id
      ).length;

      if (unreadCount > 0) {
        acc[chatId] = unreadCount;
      }
      return acc;
    }, {} as UnreadMessages);

    setUnreadMessages(unreadCounts);
  }, [chats, messagesLoaded, dj?.id]);

  useEffect(() => {
    const handleSocketConnect = () => {
      socket.emit("joinRoom", `general_${trackId}`);

      if (dj) {
        socket.emit("joinRoom", `user_${dj.id}`);
      }
    };

    socket.on("connect", handleSocketConnect);

    if (socket.connected && dj) {
      socket.emit("joinRoom", `general_${trackId}`);
      socket.emit("joinRoom", `user_${dj.id}`);
    }

    const handleDJTyping = (data: { chatId: string; dj: DJ }) => {
      setDJTyping((prevTyping) => ({
        ...prevTyping,
        [data.chatId]: {
          isTyping: true,
          typingDJ: data.dj,
        },
      }));

      if (typingTimeoutRef.current[data.chatId]) {
        clearTimeout(typingTimeoutRef.current[data.chatId]);
      }

      typingTimeoutRef.current[data.chatId] = setTimeout(() => {
        setDJTyping((prevTyping) => ({
          ...prevTyping,
          [data.chatId]: {
            isTyping: false,
            typingDJ: null,
          },
        }));
      }, 1000);
    };

    socket.on("chat message", async (message: Message) => {
      const isChatOpen = Number(selectedChat) === Number(message.chatId);
      const isRecipient = Number(message.receiveDJId) === Number(dj?.id);

      if (isChatOpen && isRecipient) {
        await messageActions.markMessagesAsRead([message.id], token);
        setUnreadMessages((prevUnreadMessages) => {
          const updatedUnreadMessages = { ...prevUnreadMessages };
          delete updatedUnreadMessages[message.chatId || "general"];
          return updatedUnreadMessages;
        });
      }

      setChats((prevChats) => {
        const chatId = message.chatId || "general";
        const updatedChats = { ...prevChats };

        updatedChats[chatId] = [
          ...(updatedChats[chatId] || []),
          {
            id: message.id,
            djId: message.djId,
            receiveDJId: message.receiveDJId,
            message: message.message,
            dj: message.dj,
            receiveDJ: message.receiveDJ,
            createdAt: message.createdAt,
            read: isChatOpen && isRecipient,
            isReply: message.isReply,
            replyTo: message.replyTo,
          },
        ];

        return updatedChats;
      });
    });

    socket.on(
      "messages marked as read",
      ({ messageIds }: { messageIds: number[] }) => {
        setChats((prevChats) => {
          const updatedChats = { ...prevChats };

          Object.keys(updatedChats).forEach((chatId) => {
            updatedChats[chatId] = updatedChats[chatId].map((message) =>
              messageIds.includes(message.id)
                ? { ...message, read: true }
                : message
            );
          });

          setInputHeight(0);
          return updatedChats;
        });
      });

    socket.on("dj typing", handleDJTyping);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("chat message");
      socket.off("messages marked as read");
      socket.off("dj typing", handleDJTyping);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj, selectedChat]);

  return { unreadMessages, djTyping, setUnreadMessages, typingTimeoutRef };
};

export default useChatSocket;
