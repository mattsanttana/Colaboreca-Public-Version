import "../../styles/chat/ChatConversation.css";
import React from "react";
import { Col } from "react-bootstrap";
import { DJ } from "../../types/DJ";
import useFetchChatData from "../../utils/useFetchChatData";
import ChatConversationHeader from "./ChatConversationHeader";
import ChatMessageComposer from "./ChatMessageComposer";
import ChatMessageList from "./ChatMessageList";

type ChatConversationProps = Pick<
  ReturnType<typeof useFetchChatData>,
  | "selectedChat"
  | "selectedDJChat"
  | "setSelectedChat"
  | "setSelectedDJChat"
  | "djs"
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
  | "messageError"
  | "setMessage"
  | "handleChangeMessageInput"
  | "setInputHeight"
  | "handleSubmitMessage"
  | "isFirstMessageInSeries"
  | "getDJMessageById"
  | "messageRefs"
  | "hoveredMessageId"
  | "setHoveredMessageId"
  | "handleReply"
  | "handleToggleReaction"
  | "handleEditMessage"
  | "handleDeleteMessage"
  | "handleSetModerator"
  | "handleTimeoutDJ"
  | "handleRemoveTimeoutDJ"
> & {
  trackName: string;
  trackId: string | undefined;
  dj: DJ | undefined;
  ownerDJId: number | null;
};

const ChatConversation: React.FC<ChatConversationProps> = (props) => {
  const { selectedChat, selectedDJChat } = props;
  const isConversationSelected = Boolean(selectedChat || selectedDJChat);

  return (
    <Col
      md={12}
      lg={12}
      xl={12}
      xxl={6}
      className={`chat-container chat-conversation-column gradient-border ${
        isConversationSelected ? "active" : ""
      }`}
    >
      <div className="chat-conversation-panel">
        {!isConversationSelected ? (
          <div className="chat-wrapper-4">
            <h3 className="chat-heading-3">Selecione um papinho</h3>
          </div>
        ) : (
          <>
            <ChatConversationHeader
              selectedChat={props.selectedChat}
              selectedDJChat={props.selectedDJChat}
              setSelectedChat={props.setSelectedChat}
              setSelectedDJChat={props.setSelectedDJChat}
              chats={props.chats}
              djTyping={props.djTyping}
              selectedDJ={props.selectedDJ}
              getChatDJ={props.getChatDJ}
              trackName={props.trackName}
              trackId={props.trackId}
            />
            <ChatMessageList
              selectedChat={props.selectedChat}
              djs={props.djs}
              chats={props.chats}
              chatContainerRef={props.chatContainerRef}
              messageToReply={props.messageToReply}
              inputHeight={props.inputHeight}
              isFirstMessageInSeries={props.isFirstMessageInSeries}
              getDJMessageById={props.getDJMessageById}
              messageRefs={props.messageRefs}
              hoveredMessageId={props.hoveredMessageId}
              setHoveredMessageId={props.setHoveredMessageId}
              scrollToMessage={props.scrollToMessage}
              truncateText={props.truncateText}
              handleReply={props.handleReply}
              handleToggleReaction={props.handleToggleReaction}
              handleEditMessage={props.handleEditMessage}
              handleDeleteMessage={props.handleDeleteMessage}
              handleSetModerator={props.handleSetModerator}
              handleTimeoutDJ={props.handleTimeoutDJ}
              handleRemoveTimeoutDJ={props.handleRemoveTimeoutDJ}
              ownerDJId={props.ownerDJId}
              dj={props.dj}
            />
            <ChatMessageComposer
              selectedChat={props.selectedChat}
              messageToReply={props.messageToReply}
              scrollToMessage={props.scrollToMessage}
              truncateText={props.truncateText}
              setMessageToReply={props.setMessageToReply}
              message={props.message}
              messageError={props.messageError}
              setMessage={props.setMessage}
              handleChangeMessageInput={props.handleChangeMessageInput}
              setInputHeight={props.setInputHeight}
              handleSubmitMessage={props.handleSubmitMessage}
              dj={props.dj}
            />
          </>
        )}
      </div>
    </Col>
  );
};

export default ChatConversation;
