import "../../styles/chat/ChatConversation.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane, FaReply, FaTimes } from "react-icons/fa";
import { Button, Col, Form, Image } from "react-bootstrap";
import { DJ } from "../../types/DJ";
import useFetchChatData from "../../utils/useFetchChatData";
import { logo } from "../../assets/images/characterPath";

type ChatConversationProps = Pick<
  ReturnType<typeof useFetchChatData>,
  | "selectedChat"
  | "selectedDJChat"
  | "setSelectedChat"
  | "setSelectedDJChat"
  | "chats"
  | "djTyping"
  | "selectedDJ"
  | "getChatDJ"
  | "chatContainerRef"
  | "inputHeight"
  | "messageToReply"
  | "scrollToMessage"
  | "truncateText"
  | "setMessageToReply"
  | "message"
  | "handleChangeMessageInput"
  | "setInputHeight"
  | "handleSubmitMessage"
  | "isFirstMessageInSeries"
  | "getDJMessageById"
  | "messageRefs"
  | "hoveredMessageId"
  | "setHoveredMessageId"
  | "handleReply"
> & {
  trackName: string;
  trackId: string | undefined;
  dj: DJ | undefined;
};

const ChatConversation: React.FC<ChatConversationProps> = ({
  selectedChat,
  selectedDJChat,
  setSelectedChat,
  setSelectedDJChat,
  chats,
  djTyping,
  selectedDJ,
  getChatDJ,
  dj,
  trackName,
  trackId,
  chatContainerRef,
  inputHeight,
  messageToReply,
  scrollToMessage,
  truncateText,
  setMessageToReply,
  message,
  handleChangeMessageInput,
  setInputHeight,
  handleSubmitMessage,
  isFirstMessageInSeries,
  getDJMessageById,
  messageRefs,
  hoveredMessageId,
  setHoveredMessageId,
  handleReply,
}) => {
  const navigate = useNavigate();

  return (
    <Col
      md={12}
      lg={12}
      xl={12}
      xxl={6}
      className={`chat-container chat-conversation-column gradient-border ${
        selectedChat || selectedDJChat ? "active" : ""
      }`}
    >
      <div className="chat-conversation-panel">
      {!selectedChat && !selectedDJChat ? (
        <div className="chat-wrapper-4">
          <h3 className="chat-heading-3">Selecione um papinho</h3>
        </div>
      ) : (
        <>
          <div className="chat-wrapper-5">
            <div
              className="chat-wrapper-6"
              style={{
                cursor: selectedChat !== "general" ? "pointer" : "default",
              }}
            >
              <FaArrowLeft
                onClick={() => {
                  setSelectedChat(null);
                  setSelectedDJChat(null);
                }}
                className="chat-cursor chat-mobile-back"
              />
              {selectedChat !== "general" ? (
                <Image
                  className="chat-image-3"
                  src={
                    selectedDJChat
                      ? selectedDJ?.characterPath || ""
                      : selectedChat
                      ? getChatDJ(
                          chats[selectedChat][chats[selectedChat].length - 1]
                        )?.characterPath || ""
                      : ""
                  }
                  alt={
                    selectedDJChat
                      ? selectedDJ?.djName || ""
                      : selectedChat
                      ? getChatDJ(
                          chats[selectedChat][chats[selectedChat].length - 1]
                        )?.djName || ""
                      : ""
                  }
                  roundedCircle
                  onClick={() =>
                    navigate(`/track/profile/${trackId}/${selectedDJChat}`)
                  }
                />
              ) : (
                <Image
                  className="chat-image-4"
                  src={
                    selectedDJChat ? selectedDJ?.characterPath || logo : logo
                  }
                  alt={
                    selectedDJChat ? selectedDJ?.djName || trackName : trackName
                  }
                  roundedCircle
                />
              )}
              <div className="chat-wrapper-7">
                <h3>
                  {selectedDJChat
                    ? selectedDJ?.djName || ""
                    : selectedChat === "general"
                    ? trackName
                    : selectedChat
                    ? getChatDJ(
                        chats[selectedChat][chats[selectedChat].length - 1]
                      )?.djName || ""
                    : ""}
                </h3>
                <span>
                  {selectedChat !== null && djTyping[selectedChat]?.isTyping
                    ? selectedChat === "general"
                      ? `${djTyping[selectedChat].typingDJ?.djName} está digitando...`
                      : "digitando..."
                    : ""}
                </span>
              </div>
            </div>
          </div>
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
              {selectedChat !== null &&
                chats[selectedChat]?.map((msg, index) => (
                  <div
                    key={index}
                    className="message chat-message"
                    style={{
                      flexDirection:
                        msg.djId === dj?.id ? "row-reverse" : "row",
                      alignItems:
                        msg.djId === dj?.id ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.djId !== dj?.id && (
                      <div className="chat-wrapper-8">
                        {selectedChat === "general" &&
                          isFirstMessageInSeries(chats[selectedChat], index) && (
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
                        msg.djId === dj?.id ? "chat-wrapper-9-sent" : ""
                      }`}
                      onMouseEnter={() => setHoveredMessageId(msg.id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                      style={{
                        alignItems:
                          msg.djId === dj?.id ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        key={msg.id}
                        className={`chat-message-text message-text rank-${
                          msg.dj?.ranking ?? ""
                        } bi bi-chat-dots ${
                          msg.djId === dj?.id ? "bg-primary msg-right" : ""
                        }`}
                        style={{
                          margin: isFirstMessageInSeries(
                            chats[selectedChat],
                            index
                          )
                            ? "20px 0 0"
                            : "0.3% 0 0",
                          marginLeft:
                            selectedChat !== "general" && msg.djId !== dj?.id
                              ? "-50px"
                              : "0",
                        }}
                      >
                        {msg.isReply && (
                          <div
                            className="text-light chat-wrapper-10"
                            onClick={() => scrollToMessage(msg.replyTo)}
                          >
                            <strong>
                              {Number(getDJMessageById(msg.replyTo)?.djId) ===
                              Number(dj?.id)
                                ? "você"
                                : getDJMessageById(msg.replyTo)?.dj?.djName ||
                                  ""}
                            </strong>
                            <p>
                              {truncateText(
                                getDJMessageById(msg.replyTo)?.message || "",
                                62
                              )}
                            </p>
                          </div>
                        )}
                        <p
                          id="chat-text-3"
                          className={`message-text rank-${msg.dj?.ranking ?? ""}`}
                          ref={(el) => (messageRefs.current[msg.id] = el)}
                        >
                          {selectedChat === "general" &&
                            msg.djId !== dj?.id && (
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
                                </strong>
                                <br />
                              </>
                            )}
                          {msg.message}
                        </p>
                      </div>
                      {hoveredMessageId === msg.id && (
                        <button
                          type="button"
                          aria-label="Responder mensagem"
                          title="Responder"
                          className={`chat-button ${
                            msg.djId === dj?.id ? "chat-button-sent" : ""
                          }`}
                          onClick={() => handleReply(msg)}
                        >
                          <FaReply className="chat-fareply" />
                        </button>
                      )}
                      {msg.djId === dj?.id &&
                        msg.read &&
                        index === chats[selectedChat].length - 1 &&
                        selectedChat !== "general" && (
                          <small className="chat-small">visto</small>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="chat-wrapper-11">
            <div className="chat-wrapper-12">
              <div className="chat-wrapper-13">
                {messageToReply && (
                  <div
                    className="text-light chat-wrapper-14"
                    onClick={() => scrollToMessage(messageToReply.id)}
                  >
                    <strong>
                      {messageToReply.djId === dj?.id
                        ? "você"
                        : messageToReply.dj?.djName || ""}
                    </strong>
                    <p>{truncateText(messageToReply.message, 77)}</p>
                    <button
                      onClick={() => setMessageToReply(null)}
                      className="chat-position"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
                <Form.Control
                  as="textarea"
                  rows={1}
                  placeholder="Digite sua mensagem"
                  className="my-3 custom-input chat-input"
                  value={message}
                  onChange={handleChangeMessageInput}
                  onInput={(event) => {
                    const target = event.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    const newHeight = Math.min(target.scrollHeight, 150);
                    target.style.height = `${newHeight}px`;
                    setInputHeight(newHeight - 50);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmitMessage(
                        selectedChat,
                        message,
                        messageToReply,
                        event.target as HTMLTextAreaElement
                      );
                    }
                  }}
                />
              </div>
              <Button
                variant="primary"
                className="my-3 chat-margin-left"
                onClick={() => {
                  const textareaElement = document.querySelector(
                    ".chat-input"
                  ) as HTMLTextAreaElement;
                  handleSubmitMessage(
                    selectedChat,
                    message,
                    messageToReply,
                    textareaElement
                  );
                }}
              >
                <FaPaperPlane />
              </Button>
            </div>
          </div>
        </>
      )}
      </div>
    </Col>
  );
};

export default ChatConversation;
