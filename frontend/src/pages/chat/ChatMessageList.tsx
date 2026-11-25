import "../../styles/chat/ChatMessage.css";
import "../../styles/chat/ChatMessageList.css";
import React from "react";
import { Image } from "react-bootstrap";
import { Message } from "../../types/Chat";
import { DJ } from "../../types/DJ";
import useFetchChatData from "../../utils/useFetchChatData";
import ChatMessageActions from "./ChatMessageActions";
import ChatMessageReactions from "./ChatMessageReactions";

type ChatMessageListProps = Pick<
  ReturnType<typeof useFetchChatData>,
  | "selectedChat"
  | "djs"
  | "chats"
  | "chatContainerRef"
  | "messageToReply"
  | "inputHeight"
  | "isFirstMessageInSeries"
  | "getDJMessageById"
  | "messageRefs"
  | "hoveredMessageId"
  | "setHoveredMessageId"
  | "scrollToMessage"
  | "truncateText"
  | "handleReply"
  | "handleToggleReaction"
  | "handleEditMessage"
  | "handleDeleteMessage"
  | "handleSetModerator"
  | "handleTimeoutDJ"
  | "handleRemoveTimeoutDJ"
> & {
  dj: DJ | undefined;
  ownerDJId: number | null;
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  selectedChat,
  djs,
  chats,
  chatContainerRef,
  messageToReply,
  inputHeight,
  isFirstMessageInSeries,
  getDJMessageById,
  messageRefs,
  hoveredMessageId,
  setHoveredMessageId,
  scrollToMessage,
  truncateText,
  handleReply,
  handleToggleReaction,
  handleEditMessage,
  handleDeleteMessage,
  handleSetModerator,
  handleTimeoutDJ,
  handleRemoveTimeoutDJ,
  dj,
  ownerDJId,
}) => {
  const [openReactionPickerMessageId, setOpenReactionPickerMessageId] =
    React.useState<number | null>(null);
  const [openActionMenuMessageId, setOpenActionMenuMessageId] =
    React.useState<number | null>(null);
  const [messageHistory, setMessageHistory] = React.useState<Message | null>(null);
  const messages = selectedChat ? chats[selectedChat] || [] : [];

  return (
    <div
      ref={chatContainerRef}
      className="chat-container chat-chat-container"
      style={{
        paddingBottom: messageToReply
          ? `${inputHeight + 60}px`
          : `${inputHeight}px`,
      }}
    >
      <div className="messages">
        {selectedChat &&
          messages.map((msg, index) => {
            const isSentByCurrentDJ = msg.djId === dj?.id;
            const isMessageHovered = hoveredMessageId === msg.id;
            const isReactionPickerOpen =
              openReactionPickerMessageId === msg.id;
            const isActionMenuOpen = openActionMenuMessageId === msg.id;
            const canShowModerationMenu =
              !msg.deletedAt
              && (
                isSentByCurrentDJ
                || (
                  selectedChat === "general"
                  && (dj?.id === ownerDJId || dj?.isModerator)
                )
              );
            const isFirstInSeries = isFirstMessageInSeries(messages, index);
            const replyMessage = msg.isReply
              ? getDJMessageById(msg.replyTo)
              : null;

            return (
              <div
                key={msg.id}
                className="message chat-message"
                style={{
                  flexDirection: isSentByCurrentDJ ? "row-reverse" : "row",
                  alignItems: isSentByCurrentDJ ? "flex-end" : "flex-start",
                }}
              >
                {!isSentByCurrentDJ && (
                  <div className="chat-wrapper-8">
                    {selectedChat === "general" && isFirstInSeries && (
                      <Image
                        className="chat-image-5"
                        src={msg.dj?.characterPath || ""}
                        alt={msg.dj?.djName || ""}
                        roundedCircle
                      />
                    )}
                  </div>
                )}
                <div
                  className={`chat-wrapper-9 ${
                    isSentByCurrentDJ ? "chat-wrapper-9-sent" : ""
                  } ${
                    (isMessageHovered ||
                      isReactionPickerOpen ||
                      isActionMenuOpen) &&
                    !msg.deletedAt
                      ? "chat-wrapper-9-hovered"
                      : ""
                  } ${
                    (isMessageHovered ||
                      isReactionPickerOpen ||
                      isActionMenuOpen) &&
                    canShowModerationMenu
                      ? "chat-wrapper-9-menu-actions"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                  style={{
                    alignItems: isSentByCurrentDJ ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className={`chat-message-text message-text rank-${
                      msg.dj?.ranking ?? ""
                    } bi bi-chat-dots ${
                      isSentByCurrentDJ ? "msg-right" : ""
                    }`}
                    style={{
                      margin: isFirstInSeries ? "20px 0 0" : "0.3% 0 0",
                      marginLeft:
                        selectedChat !== "general" && !isSentByCurrentDJ
                          ? "-50px"
                          : "0",
                    }}
                  >
                    {replyMessage && (
                      <div
                        className="text-light chat-wrapper-10"
                        onClick={() => scrollToMessage(msg.replyTo)}
                      >
                        <strong>
                          {Number(replyMessage.djId) === Number(dj?.id)
                            ? "você"
                            : replyMessage.dj?.djName || ""}
                        </strong>
                        <p>{truncateText(replyMessage.message || "", 62)}</p>
                      </div>
                    )}
                    <p
                      id="chat-text-3"
                      className={`message-text rank-${msg.dj?.ranking ?? ""} ${
                        msg.deletedAt ? "chat-message-deleted-text" : ""
                      }`}
                      ref={(element) => {
                        messageRefs.current[msg.id] = element;
                      }}
                    >
                      {selectedChat === "general" && !isSentByCurrentDJ && (
                        <>
                          <strong>
                            {msg.dj?.djName || ""}
                            {msg.dj?.ranking === 1
                              ? "🥇"
                              : msg.dj?.ranking === 2
                              ? "🥈"
                              : msg.dj?.ranking === 3
                              ? "🥉"
                              : ""}
                            {msg.dj?.id === ownerDJId && (
                              <small className="chat-role-badge">DONO</small>
                            )}
                            {msg.dj?.isModerator && (
                              <small className="chat-role-badge">MOD</small>
                            )}
                          </strong>
                          <br />
                        </>
                      )}
                      {msg.message}
                    </p>
                    {msg.deletedAt && (
                      <small className="chat-message-deleted-label">
                        {msg.deletedByModeration
                          ? "Mensagem apagada pela moderação"
                          : "Mensagem apagada pelo DJ"}
                      </small>
                    )}
                    {msg.editedAt && !msg.deletedAt && (
                      <button
                        type="button"
                        className="chat-message-edited-label"
                        aria-label="Ver mensagem editada"
                        onClick={() => setMessageHistory(msg)}
                      >
                        editada
                      </button>
                    )}
                  </div>
                  {!msg.deletedAt && (
                    <ChatMessageReactions
                      message={msg}
                      djs={djs}
                      currentDJId={dj?.id}
                      onToggleReaction={handleToggleReaction}
                      onPickerOpenChange={(isOpen) =>
                        setOpenReactionPickerMessageId((currentId) =>
                          isOpen
                            ? msg.id
                            : currentId === msg.id
                            ? null
                            : currentId,
                        )
                      }
                      isHovered={hoveredMessageId === msg.id}
                      isActionMenuOpen={isActionMenuOpen}
                      isSentByCurrentDJ={isSentByCurrentDJ}
                    />
                  )}
                  <ChatMessageActions
                    message={msg}
                    currentDJId={dj?.id}
                    ownerDJId={ownerDJId}
                    isModerator={Boolean(dj?.isModerator)}
                    isGeneralChat={selectedChat === "general"}
                    isHovered={hoveredMessageId === msg.id}
                    isEmojiPickerOpen={isReactionPickerOpen}
                    onMenuOpenChange={(isOpen) =>
                      setOpenActionMenuMessageId((currentId) =>
                        isOpen
                          ? msg.id
                          : currentId === msg.id
                          ? null
                          : currentId,
                      )
                    }
                    onReply={handleReply}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onSetModerator={handleSetModerator}
                    onTimeoutDJ={handleTimeoutDJ}
                    onRemoveTimeoutDJ={handleRemoveTimeoutDJ}
                  />
                  {isSentByCurrentDJ &&
                    msg.read &&
                    index === messages.length - 1 &&
                    selectedChat !== "general" && (
                      <small className="chat-small">visto</small>
                    )}
                </div>
              </div>
            );
          })}
        {messageHistory && (
          <div
            className="chat-message-history-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setMessageHistory(null);
              }
            }}
          >
            <section
              className="chat-message-history-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-message-history-title"
            >
              <header>
                <h2 id="chat-message-history-title">Histórico da mensagem</h2>
                <button
                  type="button"
                  aria-label="Fechar histórico"
                  onClick={() => setMessageHistory(null)}
                >
                  ×
                </button>
              </header>
              <div className="chat-message-history-content">
                <div>
                  <strong>Mensagem antiga</strong>
                  <p>{messageHistory.previousMessage}</p>
                </div>
                <div>
                  <strong>Mensagem nova</strong>
                  <p>{messageHistory.message}</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageList;
