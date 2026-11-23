import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chats, Message } from "../types/Chat";
import useMessage from "./useMessage";
import { DJ } from "../types/DJ";
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
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [djTyping, setDJTyping] = useState<{
    [key: string]: { isTyping: boolean; typingDJ: DJ | null };
  }>({});
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [messageToReply, setMessageToReply] = useState<Message | null>(null);
  const [inputHeight, setInputHeight] = useState(0); // valor inicial (por exemplo, 50px)

  const messageActions = useMessage();
  const navigate = useNavigate();
  const typingTimeoutRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    if (!messagesLoaded) return; // Verifica se as mensagens foram carregadas

    const calculateUnreadMessages = () => {
      const unreadCounts = Object.keys(chats).reduce((acc, chatId) => {
        if (chatId === "general") return acc; // Ignora o chat geral
        const unreadCount = chats[chatId].filter(
          (message) => !message.read && message.receiveDJId === dj?.id
        ).length;

        if (unreadCount > 0) {
          acc[chatId] = unreadCount;
        }
        return acc;
      }, {} as { [key: string]: number });

      setUnreadMessages(unreadCounts);
    };

    calculateUnreadMessages();
  }, [chats, messagesLoaded, dj?.id]);

  useEffect(() => {
    const handleSocketConnect = () => {
      // Solicita a entrada na sala geral
      socket.emit("joinRoom", `general_${trackId}`);

      // Entra na sala do usuário se o DJ estiver disponível
      if (dj) {
        socket.emit("joinRoom", `user_${dj.id}`);
      }
    };

    socket.on("connect", handleSocketConnect);

    // Quando `dj` é atualizado, verifica se precisa entrar na sala do DJ
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

      // Limpar o temporizador anterior, se existir
      if (typingTimeoutRef.current[data.chatId]) {
        clearTimeout(typingTimeoutRef.current[data.chatId]);
      }

      // Definir um novo temporizador
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

    // Recebe mensagens do servidor
    socket.on("chat message", async (message) => {
      const isChatOpen = Number(selectedChat) === Number(message.chatId);
      const isRecipient = Number(message.receiveDJId) === Number(dj?.id);

      if (isChatOpen && isRecipient) {
        const messageId = [message.id];
        await messageActions.markMessagesAsRead(messageId, token);
        setUnreadMessages((prevUnreadMessages) => {
          const updatedUnreadMessages = { ...prevUnreadMessages };
          delete updatedUnreadMessages[message.chatId];
          return updatedUnreadMessages;
        });
      }

      setChats((prevChats) => {
        const chatId = message.chatId || "general";
        const updatedChats = { ...prevChats };

        // Atualizando o chat, incluindo o DJ ID e a mensagem
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
            read: isChatOpen && isRecipient, // Marca como lida se o chat estiver aberto e o destinatário for o DJ atual
            isReply: message.isReply,
            replyTo: message.replyTo,
          },
        ];

        return updatedChats;
      });
    });

    // Recebe notificações de mensagens lidas do servidor
    socket.on("messages marked as read", ({ messageIds }) => {
      setChats((prevChats) => {
        const updatedChats = { ...prevChats };

        // Atualiza o estado das mensagens para marcá-las como lidas
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

    // Limpeza do evento `connect` para evitar múltiplas adições
    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("chat message");
      socket.off("messages marked as read");
      socket.off("dj typing", handleDJTyping);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj, selectedChat]);

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
