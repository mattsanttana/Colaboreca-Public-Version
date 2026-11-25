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
  trackId: string | undefined
) => {
  const { djChat } = useParams();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedDJChat, setSelectedDJChat] = useState<number | null>(null);
  const [chats, setChats] = useState<Chats>({});
  const [message, setMessage] = useState("");
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
    if (selectedDJChat) {
      const response = await messageActions.sendMessage(
        selectedDJChat,
        message,
        messageToReply,
        token
      );

      setSelectedChat(String(response?.data.chatId));
    } else if (djId === "general") {
      await messageActions.sendMessage(null, message, messageToReply, token);
    } else {
      if (!dj) return;

      await messageActions.sendMessage(dj.id, message, messageToReply, token);
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
    const messages = chats[chatId];
    const unreadMessages = messages.filter(
      (message) => !message.read && message.djId !== dj?.id
    ); // Filtra as mensagens não lidas e não enviadas pelo cliente
    const unreadMessageIds = unreadMessages.map((message) => message.id); // Extrai os IDs das mensagens não lidas
    if (unreadMessageIds.length > 0) {
      await messageActions.markMessagesAsRead(unreadMessageIds, token);
    }
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

  const sortedChatIds = useMemo(() => {
    return Object.keys(chats)
      .filter((chatId) => chatId !== "general")
      .sort((a, b) => {
        const lastMessageA = chats[a][chats[a].length - 1];
        const lastMessageB = chats[b][chats[b].length - 1];

        return (
          new Date(lastMessageB.createdAt).getTime() -
          new Date(lastMessageA.createdAt).getTime()
        );
      });
  }, [chats]);

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

  const lastGeneralMessage = useMemo(() => {
    const generalMessages = chats["general"] || [];
    const message = generalMessages[generalMessages.length - 1];

    return {
      djId: message?.djId || "",
      message: message || "",
    };
  }, [chats]);

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
    const lastMessage = chats[chatId][chats[chatId].length - 1];

    setSelectedChat(chatId);
    setSelectedDJChat(getChatDJ(lastMessage)?.id ?? null);
    handleMarkAsRead(chatId);
  };

  const handleReply = (message: Message) => {
    setMessageToReply(message);
  };

  return {
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
    isFirstMessageInSeries,
    handleViewProfile,
    handleStartChat,
    handleSelectChat,
    handleReply,
  };
};

export default useFetchChatData;
