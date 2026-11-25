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

const mapMessagesToChats = (messages: Message[]): Chats =>
  messages.reduce((acc: Chats, message: Message) => {
    const chatId = message.chatId || "general";
    acc[chatId] = [
      ...(acc[chatId] || []),
      {
        id: message.id,
        chatId: message.chatId ? String(message.chatId) : undefined,
        djId: message.djId,
        receiveDJId: message.receiveDJId,
        message: message.message,
        previousMessage: message.previousMessage,
        editedAt: message.editedAt,
        dj: message.dj,
        receiveDJ: message.receiveDJ,
        createdAt: new Date(message.createdAt),
        read: message.read,
        isReply: message.isReply,
        replyTo: message.replyTo,
        reactions: message.reactions || [],
        deletedAt: message.deletedAt,
        deletedByDJId: message.deletedByDJId,
        deletedByModeration: message.deletedByModeration,
      },
    ];
    return acc;
  }, {});

interface UseChatSocketOptions {
  token: string;
  dj: DJ | undefined;
  ownerDJId: number | null;
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
  ownerDJId,
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
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const typingTimeoutRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const djMessages = await messageActions.getAllMessagesForThisDJ(token);

        if (djMessages?.status === 200) {
          setChats(mapMessagesToChats(djMessages.data));
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
      const messages = chats[chatId];
      let unreadCount = 0;
      if (chatId === "general") {
        const ownMessageIds = new Set(
          messages.filter((message) => message.djId === dj?.id).map(({ id }) => id)
        );
        unreadCount = messages.filter(
          (message) =>
            !message.read
            && message.djId !== dj?.id
            && message.isReply
            && message.replyTo !== null
            && ownMessageIds.has(message.replyTo)
        ).length;
      } else {
        unreadCount = messages.reduce((count, message) => {
          const unreadIncoming = !message.read && message.receiveDJId === dj?.id;
          const unreadReactions =
            message.djId === dj?.id
              ? (message.reactions || []).filter(
                  (reaction) => reaction.djId !== dj?.id && !reaction.read
                ).length
              : 0;
          return count + Number(unreadIncoming) + unreadReactions;
        }, 0);
      }

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
      const isChatOpen =
        message.chatId == null
          ? selectedChat === "general"
          : Number(selectedChat) === Number(message.chatId);
      const isRecipient = Number(message.receiveDJId) === Number(dj?.id);
      const isReplyToCurrentDJMessage =
        message.chatId == null
        && message.isReply
        && message.replyTo != null
        && chatsRef.current.general?.some(
          (existingMessage) =>
            existingMessage.id === message.replyTo
            && existingMessage.djId === dj?.id
        );

      if (isChatOpen && (isRecipient || isReplyToCurrentDJMessage)) {
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
            chatId: message.chatId ? String(message.chatId) : undefined,
            djId: message.djId,
            receiveDJId: message.receiveDJId,
            message: message.message,
            previousMessage: message.previousMessage,
            editedAt: message.editedAt,
            dj: message.dj,
            receiveDJ: message.receiveDJ,
            createdAt: message.createdAt,
            read: isChatOpen && (isRecipient || isReplyToCurrentDJMessage),
            isReply: message.isReply,
            replyTo: message.replyTo,
            reactions: message.reactions || [],
            deletedAt: message.deletedAt,
            deletedByDJId: message.deletedByDJId,
            deletedByModeration: message.deletedByModeration,
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

    socket.on(
      "message reactions marked as read",
      ({ messageIds }: { messageIds: number[] }) => {
        setChats((previousChats) => {
          const updatedChats = { ...previousChats };
          Object.keys(updatedChats).forEach((chatId) => {
            updatedChats[chatId] = updatedChats[chatId].map((message) =>
              messageIds.includes(message.id)
                ? {
                    ...message,
                    reactions: message.reactions?.map((reaction) => ({
                      ...reaction,
                      read: true,
                    })),
                  }
                : message
            );
          });
          return updatedChats;
        });
      }
    );

      const handleMessageReactionUpdated = (reactionUpdate: {
        messageId: number;
        emoji: string;
        djId: number;
        active: boolean;
        createdAt?: string | Date | null;
      }) => {
        const reactionMessage = Object.values(chatsRef.current)
          .flat()
          .find((message) => message.id === reactionUpdate.messageId);
        const reactionChatId = Object.keys(chatsRef.current).find((chatId) =>
          chatsRef.current[chatId].some(
            (message) => message.id === reactionUpdate.messageId
          )
        );
        const shouldMarkReactionRead =
          reactionUpdate.active
          && reactionUpdate.djId !== dj?.id
          && reactionMessage?.djId === dj?.id
          && reactionChatId !== "general"
          && reactionChatId === selectedChat;
        if (shouldMarkReactionRead) {
          void messageActions
            .markMessageReactionsAsRead([reactionUpdate.messageId], token)
            .then((response) => {
              if (response?.status !== 200) {
                console.error("Could not mark message reactions as read:", response?.data);
              } else {
                setChats((previousChats) => {
                  const updatedChats = { ...previousChats };
                  Object.keys(updatedChats).forEach((chatId) => {
                    updatedChats[chatId] = updatedChats[chatId].map((message) =>
                      message.id === reactionUpdate.messageId
                        ? {
                            ...message,
                            reactions: message.reactions?.map((reaction) => ({
                              ...reaction,
                              read: true,
                            })),
                          }
                        : message
                    );
                  });
                  return updatedChats;
                });
              }
            });
        }

        setChats((previousChats) => {
          const updatedChats = { ...previousChats };
          Object.keys(updatedChats).forEach((chatId) => {
            updatedChats[chatId] = updatedChats[chatId].map((message) => {
              if (message.id !== reactionUpdate.messageId) return message;

              const reactions = message.reactions || [];
              const alreadyApplied = reactions.some(
                (reaction) =>
                  reaction.djId === reactionUpdate.djId
                  && reaction.emoji === reactionUpdate.emoji
              );
              return {
                ...message,
                reactions: reactionUpdate.active
                  ? alreadyApplied
                    ? reactions
                    : [
                        ...reactions,
                        {
                          djId: reactionUpdate.djId,
                          emoji: reactionUpdate.emoji,
                          createdAt: reactionUpdate.createdAt || new Date(),
                          read: false,
                        },
                      ]
                  : reactions.filter(
                      (reaction) =>
                        reaction.djId !== reactionUpdate.djId
                        || reaction.emoji !== reactionUpdate.emoji
                    ),
              };
            });
          });
          return updatedChats;
        });
      };

      socket.on("message reaction updated", handleMessageReactionUpdated);

      const handleChatMessageEdited = (update: {
        messageId: number;
        message: string;
        previousMessage: string;
        editedAt: string;
      }) => {
        setChats((previousChats) => {
          const updatedChats = { ...previousChats };
          Object.keys(updatedChats).forEach((chatId) => {
            updatedChats[chatId] = updatedChats[chatId].map((message) =>
              message.id === update.messageId
                ? {
                    ...message,
                    message: update.message,
                    previousMessage: update.previousMessage,
                    editedAt: update.editedAt,
                  }
                : message
            );
          });
          return updatedChats;
        });
      };

      socket.on("chat message edited", handleChatMessageEdited);

      const handleDJModerationUpdated = (updatedDJ: DJ) => {
        const currentDJRoleChanged =
          updatedDJ.id === dj?.id
          && Boolean(updatedDJ.isModerator) !== Boolean(dj.isModerator);

        setChats((previousChats) => {
          const updatedChats = { ...previousChats };
          Object.keys(updatedChats).forEach((chatId) => {
            updatedChats[chatId] = updatedChats[chatId].map((message) => ({
              ...message,
              dj:
                message.dj?.id === updatedDJ.id ? updatedDJ : message.dj,
              receiveDJ:
                message.receiveDJ?.id === updatedDJ.id
                  ? updatedDJ
                  : message.receiveDJ,
            }));
          });
          return updatedChats;
        });

        if (currentDJRoleChanged) {
          void messageActions.getAllMessagesForThisDJ(token).then((response) => {
            if (response?.status === 200) {
              setChats(mapMessagesToChats(response.data));
            }
          });
        }
      };

      socket.on("dj updated", handleDJModerationUpdated);

      const handleChatMessageDeleted = async (deletion: {
        messageId: number;
        deletedAt: string;
        deletedByModeration: boolean;
      }) => {
        setChats((previousChats) => {
          const updatedChats = { ...previousChats };
          Object.keys(updatedChats).forEach((chatId) => {
            updatedChats[chatId] = updatedChats[chatId].map((message) => {
              if (message.id !== deletion.messageId) return message;
              return {
                ...message,
                message: deletion.deletedByModeration
                  ? "Essa mensagem foi apagada pela moderação"
                  : "Essa mensagem foi apagada pelo DJ",
                previousMessage: null,
                deletedAt: deletion.deletedAt,
                deletedByModeration: deletion.deletedByModeration,
                reactions: [],
              };
            });
          });
          return updatedChats;
        });

        if (dj?.isModerator || dj?.id === ownerDJId) {
          const response = await messageActions.getAllMessagesForThisDJ(token);
          if (response?.status !== 200 || !Array.isArray(response.data)) return;
          const authorizedMessage = response.data.find(
            (message: Message) => message.id === deletion.messageId
          );
          if (!authorizedMessage) return;

          setChats((previousChats) => {
            const updatedChats = { ...previousChats };
            Object.keys(updatedChats).forEach((chatId) => {
              updatedChats[chatId] = updatedChats[chatId].map((message) =>
                message.id === deletion.messageId
                  ? { ...message, ...authorizedMessage }
                  : message
              );
            });
            return updatedChats;
          });
        }
      };

      socket.on("chat message deleted", handleChatMessageDeleted);

      socket.on("dj typing", handleDJTyping);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("chat message");
      socket.off("messages marked as read");
      socket.off("message reactions marked as read");
      socket.off("message reaction updated", handleMessageReactionUpdated);
      socket.off("chat message edited", handleChatMessageEdited);
      socket.off("dj updated", handleDJModerationUpdated);
      socket.off("chat message deleted", handleChatMessageDeleted);
      socket.off("dj typing", handleDJTyping);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj, selectedChat]);

  return { unreadMessages, djTyping, setUnreadMessages, typingTimeoutRef };
};

export default useChatSocket;
