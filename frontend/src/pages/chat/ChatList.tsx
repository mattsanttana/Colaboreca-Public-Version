import "../../styles/chat/ChatList.css";
import React from "react";
import { Col, Form, Image, ListGroup } from "react-bootstrap";
import { DJ } from "../../types/DJ";
import useFetchChatData from "../../utils/useFetchChatData";

type ChatListProps = Pick<
  ReturnType<typeof useFetchChatData>,
  | "search"
  | "handleChange"
  | "handleFocus"
  | "showSuggestions"
  | "availableDJs"
  | "handleStartChat"
  | "selectedChat"
  | "selectedDJChat"
  | "setSelectedChat"
  | "setSelectedDJChat"
  | "sortedChatIds"
  | "chats"
  | "djTyping"
  | "lastGeneralMessage"
  | "truncateText"
  | "handleSelectChat"
  | "getChatDJ"
  | "unreadMessages"
> & {
  dj: DJ | undefined;
  trackName: string;
  logo: string;
};

const ChatList: React.FC<ChatListProps> = ({
  dj,
  trackName,
  logo,
  search,
  handleChange,
  handleFocus,
  showSuggestions,
  availableDJs,
  handleStartChat,
  selectedChat,
  selectedDJChat,
  setSelectedChat,
  setSelectedDJChat,
  sortedChatIds,
  chats,
  djTyping,
  lastGeneralMessage,
  truncateText,
  handleSelectChat,
  getChatDJ,
  unreadMessages,
}) => (
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
      <div className="chat-wrapper">
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
                onClick={() => handleStartChat(djItem.id)}
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
          onClick={() => {
            setSelectedChat("general");
            setSelectedDJChat(null);
          }}
        >
          <Image
            className="chat-image"
            src={logo}
            alt={trackName}
            roundedCircle
          />
          <div>
            <h5 className="chat-heading">{trackName}</h5>
            <p className="chat-text">
              {djTyping.general?.isTyping ? (
                <span className="chat-label">
                  <strong>
                    {djTyping.general.typingDJ?.djName} está digitando...
                  </strong>
                </span>
              ) : (
                <>
                  <strong>
                    {lastGeneralMessage.djId === dj?.id
                      ? "Você"
                      : lastGeneralMessage.message.dj?.djName || ""}
                  </strong>
                  {lastGeneralMessage.message.message && (
                    <>
                      <strong>:</strong> &nbsp;
                    </>
                  )}
                  {(() => {
                    const djName =
                      lastGeneralMessage.djId === dj?.id
                        ? "Você"
                        : lastGeneralMessage.message.dj?.djName || "";
                    return truncateText(
                      lastGeneralMessage.message.message,
                      29 - djName.length
                    );
                  })()}
                </>
              )}
            </p>
          </div>
        </div>
      </ListGroup.Item>
      {sortedChatIds.map((chatId) => {
        const lastMessage = chats[chatId][chats[chatId].length - 1];
        const chatDJ = getChatDJ(lastMessage);

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
                <h5 className="chat-heading-2">{chatDJ?.djName || ""}</h5>
                {djTyping[chatId]?.isTyping ? (
                  <span className="chat-label-2">
                    <strong>digitando...</strong>
                  </span>
                ) : (
                  <p className="chat-text-2">
                    {truncateText(lastMessage.message, 28)}
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

export default ChatList;
