import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chats, Message } from "../types/Chat";
import useMessage from "./useMessage";
import { DJ } from "../types/DJ";
import useChatSocket from "./useChatSocket";
import socket from "./socket";

const useFetchChatData = (
  token: string,
  dj: DJ | undefined,
  djs: DJ[],
  trackId: string | undefined,
  ownerDJId: number | null
) => {
  const { djChat } = useParams();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedDJChat, setSelectedDJChat] = useState<number | null>(null);
  const [chats, setChats] = useState<Chats>({});
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [messageToReply, setMessageToReply] = useState<Message | null>(null);
  const [inputHeight, setInputHeight] = useState(0); // valor inicial (por exemplo, 50px)

  const messageActions = useMessage();
  const navigate = useNavigate();
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { unreadMessages, djTyping, typingTimeoutRef } = useChatSocket({
    token,
    dj,
    ownerDJId,
    trackId,
    selectedChat,
    chats,
    setChats,
    messageActions,
    setInputHeight,
  });

  useEffect(() => {
    if (djChat && !selectedChat) {
      let chatFound = false;
      for (const chatId in chats) {
        if (chatId === "general") continue;
        const chat = chats[chatId];
        // Verifica todas as mensagens na conversa
        for (const message of chat) {
          if (
            Number(message.djId) === Number(djChat) ||
            Number(message.receiveDJId) === Number(djChat)
          ) {
            setSelectedChat(chatId);
            setSelectedDJChat(Number(djChat));
            chatFound = true;
            break;
          }
        }
        if (chatFound) break;
      }
      if (!chatFound) {
        setSelectedChat(null);
        setSelectedDJChat(Number(djChat));
      }
    }
  }, [chats, djChat, selectedChat]);

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleChangeMessageInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMessage(event.target.value);
    setMessageError("");

    socket.emit("typing", {
      chatId: selectedChat,
      djId: dj?.id,
      trackId,
    });

    if (event.target.value === "") {
      setInputHeight(0);
    }
  };

  const handleSubmitMessage = async (
    djId: string | null,
    message: string,
    messageToReply: Message | null,
    textareaElement: HTMLTextAreaElement
  ) => {
    setMessageError("");
    let response: Awaited<ReturnType<typeof messageActions.sendMessage>>;

    if (selectedDJChat) {
      response = await messageActions.sendMessage(
        selectedDJChat,
        message,
        messageToReply,
        token
      );

      if (response?.status !== 201) {
        setMessageError(
          response?.status === 403
            ? "Você está temporariamente impedido de enviar mensagens."
            : "Não foi possível enviar a mensagem."
        );
        return;
      }
      setSelectedChat(String(response?.data.chatId));
    } else if (djId === "general") {
      response = await messageActions.sendMessage(
        null,
        message,
        messageToReply,
        token
      );
    } else {
      if (!dj) return;

      response = await messageActions.sendMessage(
        dj.id,
        message,
        messageToReply,
        token
      );
    }

    if (response?.status !== 201) {
      setMessageError(
        response?.status === 403
          ? "Você está temporariamente impedido de enviar mensagens."
          : "Não foi possível enviar a mensagem."
      );
      return;
    }

    setMessage("");
    setMessageToReply(null);
    textareaElement.style.height = "auto";

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleMarkAsRead = async (chatId: string) => {
    const messages = chats[chatId] || [];
    const ownMessageIds = new Set(
      messages.filter((message) => message.djId === dj?.id).map(({ id }) => id)
    );
    const unreadMessages =
      chatId === "general"
        ? messages.filter(
            (message) =>
              !message.read
              && message.djId !== dj?.id
              && message.isReply
              && message.replyTo !== null
              && ownMessageIds.has(message.replyTo)
          )
        : messages.filter(
            (message) =>
              !message.read
              && message.djId !== dj?.id
              && message.receiveDJId === dj?.id
          );
    const unreadMessageIds = unreadMessages.map(({ id }) => id);
    const unreadReactionMessageIds =
      chatId === "general"
        ? []
        : messages
            .filter(
              (message) =>
                message.djId === dj?.id
                && (message.reactions || []).some(
                  (reaction) => reaction.djId !== dj?.id && !reaction.read
                )
            )
            .map(({ id }) => id);

    let readMessageIds: number[] = [];
    if (unreadMessageIds.length > 0) {
      const response = await messageActions.markMessagesAsRead(
        unreadMessageIds,
        token
      );
      if (response?.status !== 200) {
        console.error("Could not mark chat messages as read:", response?.data);
      } else {
        readMessageIds = unreadMessageIds;
      }
    }
    let readReactionMessageIds: number[] = [];
    if (unreadReactionMessageIds.length > 0) {
      const response = await messageActions.markMessageReactionsAsRead(
        unreadReactionMessageIds,
        token
      );
      if (response?.status !== 200) {
        console.error("Could not mark message reactions as read:", response?.data);
      } else {
        readReactionMessageIds = unreadReactionMessageIds;
      }
    }

    setChats((previousChats) => ({
      ...previousChats,
      [chatId]: (previousChats[chatId] || []).map((message) => ({
        ...message,
        read: readMessageIds.includes(message.id) ? true : message.read,
        reactions: message.reactions?.map((reaction) =>
          readReactionMessageIds.includes(message.id)
            ? { ...reaction, read: true }
            : reaction
        ),
      })),
    }));
  };

  const scrollToMessage = (messageId: number) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement && chatContainerRef.current) {
      const containerTop = chatContainerRef.current.getBoundingClientRect().top;
      const elementTop = messageElement.getBoundingClientRect().top;
      const offset =
        elementTop - containerTop + chatContainerRef.current.scrollTop;
      chatContainerRef.current.scrollTop = offset;
      messageElement.classList.add("blink");
      setTimeout(() => {
        messageElement.classList.remove("blink");
      }, 3000); // Remove a classe após 3 segundos
    }
  };

  const filteredDJs = useMemo(() => {
    return djs.filter(
      (djItem) =>
        djItem.id !== dj?.id &&
        djItem.djName.toLowerCase().includes(search.toLowerCase())
    );
  }, [djs, dj, search]);

  const getChatDJ = useCallback(
    (message: Message) =>
      message.dj?.id === dj?.id ? message.receiveDJ : message.dj,
    [dj?.id]
  );

  const existingChatDJIds = useMemo(() => {
    return Object.keys(chats).reduce((acc, chatId) => {
      const chat = chats[chatId];
      // Ignorar mensagens do chat "general"
      if (chatId === "general") return acc;

      const lastMessage = chat[chat.length - 1];
      const otherDJId = getChatDJ(lastMessage)?.id;
      acc.add(String(otherDJId));
      return acc;
    }, new Set<string>());
  }, [chats, getChatDJ]);

  const availableDJs = useMemo(() => {
    return filteredDJs.filter(
      (djItem) => !existingChatDJIds.has(String(djItem.id))
    );
  }, [filteredDJs, existingChatDJIds]);

  const selectedDJ = useMemo(
    () => djs.find((djItem) => djItem.id === selectedDJChat),
    [djs, selectedDJChat]
  );

  const getDJMessageById = (messageId: number) => {
    for (const chatId in chats) {
      const message = chats[chatId].find((message) => message.id === messageId);
      if (message) return message;
    }
    return null;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const getChatActivity = useCallback(
    (messages: Message[]) => {
      const lastMessage = messages[messages.length - 1];
      let latestReaction: { createdAt: number; djName: string } | null = null;

      for (const message of messages) {
        if (message.djId !== dj?.id) continue;
        for (const reaction of message.reactions || []) {
          if (reaction.djId === dj?.id || !reaction.createdAt) continue;
          const createdAt = new Date(reaction.createdAt).getTime();
          if (!Number.isFinite(createdAt)) continue;
          if (!latestReaction || createdAt > latestReaction.createdAt) {
            latestReaction = {
              createdAt,
              djName:
                djs.find((candidate) => candidate.id === reaction.djId)?.djName
                || "Alguém",
            };
          }
        }
      }

      const lastMessageTime = lastMessage
        ? new Date(lastMessage.createdAt).getTime()
        : 0;
      if (latestReaction && latestReaction.createdAt > lastMessageTime) {
        return {
          timestamp: latestReaction.createdAt,
          preview: `${latestReaction.djName} reagiu a sua mensagem`,
          kind: "reaction" as const,
        };
      }

      return {
        timestamp: lastMessageTime,
        preview: lastMessage?.message || "",
        kind: "message" as const,
      };
    },
    [dj?.id, djs]
  );

  const sortedChatIds = useMemo(() => {
    return Object.keys(chats)
      .filter((chatId) => chatId !== "general")
      .sort(
        (a, b) =>
          getChatActivity(chats[b]).timestamp -
          getChatActivity(chats[a]).timestamp
      );
  }, [chats, getChatActivity]);

  const lastGeneralMessage = useMemo(() => {
    const generalMessages = chats["general"] || [];
    const message = generalMessages[generalMessages.length - 1];
    const activity = getChatActivity(generalMessages);
    const authorName =
      message?.djId === dj?.id ? "Você" : message?.dj?.djName || "";

    return {
      djId: message?.djId || "",
      message: message || "",
      preview:
        activity.kind === "reaction"
          ? activity.preview
          : `${authorName}${activity.preview ? `: ${activity.preview}` : ""}`,
    };
  }, [chats, dj?.id, getChatActivity]);

  const isFirstMessageInSeries = (messages: Message[], index: number) => {
    if (index === 0) return true;
    return messages[index - 1].djId !== messages[index].djId;
  };

  const handleViewProfile = (djId: string) => {
    const profileUrl = `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const handleStartChat = (djId: number) => {
    setSelectedChat(null);
    setSelectedDJChat(djId);
  };

  const handleSelectChat = (chatId: string) => {
    const messages = chats[chatId] || [];
    const lastMessage = messages[messages.length - 1];

    setSelectedChat(chatId);
    setSelectedDJChat(
      chatId === "general" || !lastMessage
        ? null
        : getChatDJ(lastMessage)?.id ?? null
    );
    handleMarkAsRead(chatId);
  };

  const handleReply = (message: Message) => {
    setMessageToReply(message);
  };

  const handleToggleReaction = async (messageId: number, emoji: string) => {
    if (!dj) return;

    const response = await messageActions.toggleMessageReaction(
      messageId,
      emoji,
      token
    );

    if (!response || response.status !== 200) {
      console.error("Could not update message reaction:", response?.data);
      return;
    }

    const { active, djId, createdAt } = response.data as {
      active: boolean;
      djId: number;
      createdAt?: string | Date | null;
    };

    setChats((previousChats) => {
      const updatedChats = { ...previousChats };
      Object.keys(updatedChats).forEach((chatId) => {
        updatedChats[chatId] = updatedChats[chatId].map((chatMessage) => {
          if (chatMessage.id !== messageId) return chatMessage;

          const reactions = chatMessage.reactions || [];
          const hasReaction = reactions.some(
            (reaction) =>
              reaction.djId === djId && reaction.emoji === emoji
          );
          return {
            ...chatMessage,
            reactions: active
              ? hasReaction
                ? reactions
                : [
                    ...reactions,
                    {
                      djId,
                      emoji,
                      createdAt: createdAt || new Date(),
                      read: false,
                    },
                  ]
              : reactions.filter(
                  (reaction) =>
                    reaction.djId !== djId || reaction.emoji !== emoji
                ),
          };
        });
      });
      return updatedChats;
    });
  };

  const handleEditMessage = async (messageId: number, content: string) => {
    const response = await messageActions.editMessage(messageId, content, token);
    if (response?.status !== 200) {
      console.error("Could not edit message:", response?.data);
      return false;
    }

    const update = response.data as {
      messageId: number;
      message: string;
      previousMessage: string | null;
      editedAt: string | Date | null;
    };
    setChats((previousChats) => {
      const updatedChats = { ...previousChats };
      Object.keys(updatedChats).forEach((chatId) => {
        updatedChats[chatId] = updatedChats[chatId].map((chatMessage) =>
          chatMessage.id === messageId
            ? {
                ...chatMessage,
                message: update.message,
                previousMessage: update.previousMessage,
                editedAt: update.editedAt,
              }
            : chatMessage
        );
      });
      return updatedChats;
    });
    return true;
  };

  const handleDeleteMessage = async (messageId: number) => {
    const response = await messageActions.deleteMessage(messageId, token);
    if (response?.status !== 200) {
      console.error("Could not delete message:", response?.data);
      return false;
    }
    return true;
  };

  const handleSetModerator = async (djId: number, enabled: boolean) => {
    const response = await messageActions.setModerator(djId, enabled, token);
    if (response?.status !== 200) {
      console.error("Could not update moderator role:", response?.data);
      return false;
    }
    return true;
  };

  const handleTimeoutDJ = async (
    djId: number,
    type: "chat" | "queue",
    durationMs: number
  ) => {
    const response = await messageActions.timeoutDJ(
      djId,
      type,
      durationMs,
      token
    );
    if (response?.status !== 200) {
      console.error("Could not apply timeout:", response?.data);
      return false;
    }
    return true;
  };

  const handleRemoveTimeoutDJ = async (
    djId: number,
    type: "chat" | "queue"
  ) => {
    const response = await messageActions.removeTimeoutDJ(djId, type, token);
    if (response?.status !== 200) {
      console.error("Could not remove DJ timeout:", response?.data);
      return false;
    }
    return true;
  };

  return {
    djs,
    search,
    setSearch,
    showSuggestions,
    setShowSuggestions,
    selectedChat,
    setSelectedChat,
    selectedDJChat,
    setSelectedDJChat,
    chats,
    setChats,
    message,
    setMessage,
    messageError,
    unreadMessages,
    djTyping,
    hoveredMessageId,
    setHoveredMessageId,
    messageToReply,
    setMessageToReply,
    inputHeight,
    setInputHeight,
    messageActions,
    navigate,
    typingTimeoutRef,
    messageRefs,
    chatContainerRef,
    handleFocus,
    handleChange,
    handleChangeMessageInput,
    handleSubmitMessage,
    handleMarkAsRead,
    scrollToMessage,
    filteredDJs,
    existingChatDJIds,
    availableDJs,
    sortedChatIds,
    getChatDJ,
    selectedDJ,
    getDJMessageById,
    truncateText,
    lastGeneralMessage,
    getChatActivity,
    isFirstMessageInSeries,
    handleViewProfile,
    handleStartChat,
    handleSelectChat,
    handleReply,
    handleToggleReaction,
    handleEditMessage,
    handleDeleteMessage,
    handleSetModerator,
    handleTimeoutDJ,
    handleRemoveTimeoutDJ,
  };
};

export default useFetchChatData;
