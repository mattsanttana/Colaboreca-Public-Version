import "../../styles/chat/ChatConversationHeader.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Image } from "react-bootstrap";
import useFetchChatData from "../../utils/useFetchChatData";
import { logo } from "../../assets/images/characterPath";

type ChatConversationHeaderProps = Pick<
  ReturnType<typeof useFetchChatData>,
  | "selectedChat"
  | "selectedDJChat"
  | "setSelectedChat"
  | "setSelectedDJChat"
  | "chats"
  | "djTyping"
  | "selectedDJ"
  | "getChatDJ"
> & {
  trackName: string;
  trackId: string | undefined;
};

const ChatConversationHeader: React.FC<ChatConversationHeaderProps> = ({
  selectedChat,
  selectedDJChat,
  setSelectedChat,
  setSelectedDJChat,
  chats,
  djTyping,
  selectedDJ,
  getChatDJ,
  trackName,
  trackId,
}) => {
  const navigate = useNavigate();
  const selectedChatMessages = selectedChat ? chats[selectedChat] || [] : [];
  const chatDJ = selectedChatMessages.length
    ? getChatDJ(selectedChatMessages[selectedChatMessages.length - 1])
    : undefined;
  const isGeneralChat = selectedChat === "general";
  const participant = selectedDJChat ? selectedDJ : chatDJ;

  return (
    <div className="chat-wrapper-5">
      <div
        className="chat-wrapper-6"
        style={{ cursor: !isGeneralChat ? "pointer" : "default" }}
      >
        <FaArrowLeft
          onClick={() => {
            setSelectedChat(null);
            setSelectedDJChat(null);
          }}
          className="chat-cursor chat-mobile-back"
        />
        {isGeneralChat ? (
          <Image
            className="chat-image-4"
            src={selectedDJChat ? selectedDJ?.characterPath || logo : logo}
            alt={selectedDJChat ? selectedDJ?.djName || trackName : trackName}
            roundedCircle
          />
        ) : (
          <Image
            className="chat-image-3"
            src={participant?.characterPath || ""}
            alt={participant?.djName || ""}
            roundedCircle
            onClick={() =>
              navigate(`/track/profile/${trackId}/${selectedDJChat}`)
            }
          />
        )}
        <div className="chat-wrapper-7">
          <h3>
            {selectedDJChat
              ? selectedDJ?.djName || ""
              : isGeneralChat
              ? trackName
              : chatDJ?.djName || ""}
          </h3>
          <span>
            {selectedChat && djTyping[selectedChat]?.isTyping
              ? isGeneralChat
                ? `${djTyping[selectedChat].typingDJ?.djName} está digitando...`
                : "digitando..."
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationHeader;
