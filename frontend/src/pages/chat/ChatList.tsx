import "../../styles/chat/ChatList.css";
import React, { useEffect, useRef } from "react";
import { Col, Form, Image, ListGroup } from "react-bootstrap";
import useFetchChatData from "../../utils/useFetchChatData";

type ChatListProps = Pick<
  ReturnType<typeof useFetchChatData>,
  | "search"
  | "handleChange"
  | "handleFocus"
  | "showSuggestions"
  | "setShowSuggestions"
  | "availableDJs"
  | "handleStartChat"
  | "selectedChat"
  | "selectedDJChat"
  | "sortedChatIds"
  | "chats"
  | "djTyping"
  | "lastGeneralMessage"
  | "truncateText"
  | "handleSelectChat"
  | "getChatDJ"
  | "getChatActivity"
  | "unreadMessages"
> & {
  trackName: string;
  logo: string;
};

const ChatList: React.FC<ChatListProps> = ({
  trackName,
  logo,
  search,
  handleChange,
  handleFocus,
  showSuggestions,
  setShowSuggestions,
  availableDJs,
  handleStartChat,
  selectedChat,
  selectedDJChat,
  sortedChatIds,
  chats,
  djTyping,
  lastGeneralMessage,
  truncateText,
  handleSelectChat,
  getChatDJ,
  getChatActivity,
  unreadMessages,
}) => {
  const chatSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !chatSearchRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [setShowSuggestions]);

  return (
    <Col
      md={12}
      lg={12}
      xl={12}
      xxl={3}
      id="chat-column"
      className={`chat-list chat-list-column gradient-border ${
        !selectedChat && !selectedDJChat ? "active" : ""
      }`}
    >
      <div className="chat-list-panel">
        <div className="chat-wrapper" ref={chatSearchRef}>
          <Form.Control
            type="text"
            placeholder="Novo papinho"
            value={search}
            onChange={handleChange}
            onFocus={handleFocus}
            className="custom-input chat-my-3"
          />
          {showSuggestions && availableDJs.length > 0 && (
            <ListGroup className="chat-suggestions">
              {availableDJs.map((djItem) => (
                <ListGroup.Item
                  className="chat-item"
                  key={djItem.id}
                  onClick={() => {
                    handleStartChat(djItem.id);
                    setShowSuggestions(false);
                  }}
                >
                  {djItem.djName}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
        <ListGroup className="chat-list-scroll">
          <ListGroup.Item
            className={`text-center chat-item-2 ${
              selectedChat === "general" ? "selected" : ""
            }`}
          >
            <div
              className="chat-wrapper-2"
              onClick={() => handleSelectChat("general")}
            >
              <Image
                className="chat-image"
                src={logo}
                alt={trackName}
                roundedCircle
              />
              <div>
                {selectedChat !== "general" && unreadMessages.general ? (
                  <span className="notification-bubble">
                    {unreadMessages.general}
                  </span>
                ) : null}
                <h5 className="chat-heading">{trackName}</h5>
                <p className="chat-text">
                  {djTyping.general?.isTyping ? (
                    <span className="chat-label">
                      <strong>
                        {djTyping.general.typingDJ?.djName} está digitando...
                      </strong>
                    </span>
                  ) : (
                    <strong>
                      {truncateText(lastGeneralMessage.preview, 42)}
                    </strong>
                  )}
                </p>
              </div>
            </div>
          </ListGroup.Item>
          {sortedChatIds.map((chatId) => {
            const lastMessage = chats[chatId][chats[chatId].length - 1];
            const chatDJ = getChatDJ(lastMessage);
            const chatActivity = getChatActivity(chats[chatId]);

            return (
              <ListGroup.Item
                key={chatId}
                className={`text-center chat-item-3 ${
                  selectedChat === chatId ? "selected" : ""
                }`}
              >
                <div
                  className="chat-wrapper-3"
                  onClick={() => handleSelectChat(chatId)}
                >
                  <Image
                    className="chat-image-2"
                    src={chatDJ?.characterPath || ""}
                    alt={chatDJ?.djName || ""}
                    roundedCircle
                  />
                  <div>
                    {selectedChat !== chatId && unreadMessages[chatId] ? (
                      <span className="notification-bubble">
                        {unreadMessages[chatId]}
                      </span>
                    ) : (
                      ""
                    )}
                    <h5 className="chat-heading-2">
                      {chatDJ?.djName || ""}
                    </h5>
                    {djTyping[chatId]?.isTyping ? (
                      <span className="chat-label-2">
                        <strong>digitando...</strong>
                      </span>
                    ) : (
                      <p className="chat-text-2">
                        {truncateText(chatActivity.preview, 28)}
                      </p>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>
    </Col>
  );
};

export default ChatList;
