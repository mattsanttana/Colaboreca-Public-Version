import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "../types/Chat";
import useMessage from "./useMessage";
import socket from "./socket";

const getUnreadChatCount = (messages: Message[], djId: number) => {
  const unreadChats = new Set<string>();
  const ownGeneralMessageIds = new Set(
    messages
      .filter((message) => message.chatId == null && message.djId === djId)
      .map((message) => message.id)
  );

  messages.forEach((message) => {
    if (message.chatId == null) {
      if (
        message.djId !== djId
        && !message.read
        && message.isReply
        && message.replyTo != null
        && ownGeneralMessageIds.has(message.replyTo)
      ) {
        unreadChats.add("general");
      }
      return;
    }

    const chatId = String(message.chatId);
    const hasUnreadIncomingMessage =
      message.receiveDJId === djId && message.djId !== djId && !message.read;
    const hasUnreadReaction =
      message.djId === djId
      && (message.reactions || []).some(
        (reaction) => reaction.djId !== djId && !reaction.read
      );

    if (hasUnreadIncomingMessage || hasUnreadReaction) {
      unreadChats.add(chatId);
    }
  });

  return unreadChats.size;
};

const useChatNotifications = (
  token: string,
  djId: number | undefined,
  trackId: number
) => {
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const messageActions = useMessage();
  const getAllMessagesRef = useRef(messageActions.getAllMessagesForThisDJ);
  getAllMessagesRef.current = messageActions.getAllMessagesForThisDJ;
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshUnreadChatCount = useCallback(async () => {
    if (!token || !djId) {
      setUnreadChatCount(0);
      return;
    }

    const response = await getAllMessagesRef.current(token);
    if (response?.status !== 200 || !Array.isArray(response.data)) {
      console.error("Could not load chat notifications:", response?.data);
      return;
    }
    setUnreadChatCount(getUnreadChatCount(response.data, djId));
  }, [djId, token]);

  useEffect(() => {
    if (!token || !djId || !trackId) return;

    const joinRooms = () => {
      socket.emit("joinRoom", `user_${djId}`);
      socket.emit("joinRoom", `general_${trackId}`);
    };
    const scheduleRefresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => {
        void refreshUnreadChatCount();
      }, 250);
    };

    if (socket.connected) joinRooms();
    socket.on("connect", joinRooms);
    socket.on("chat message", scheduleRefresh);
    socket.on("message reaction updated", scheduleRefresh);
    socket.on("messages marked as read", scheduleRefresh);
    socket.on("message reactions marked as read", scheduleRefresh);

    void refreshUnreadChatCount();

    return () => {
      socket.off("connect", joinRooms);
      socket.off("chat message", scheduleRefresh);
      socket.off("message reaction updated", scheduleRefresh);
      socket.off("messages marked as read", scheduleRefresh);
      socket.off("message reactions marked as read", scheduleRefresh);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [djId, refreshUnreadChatCount, trackId, token]);

  return unreadChatCount;
};

export default useChatNotifications;
