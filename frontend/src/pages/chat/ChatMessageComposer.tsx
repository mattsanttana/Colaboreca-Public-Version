import "../../styles/chat/ChatMessage.css";
import "../../styles/chat/ChatMessageComposer.css";
import React, { useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { DJ } from "../../types/DJ";
import useFetchChatData from "../../utils/useFetchChatData";
import ChatEmojiPicker from "./ChatEmojiPicker";

type ChatMessageComposerProps = Pick<
  ReturnType<typeof useFetchChatData>,
  | "selectedChat"
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
> & {
  dj: DJ | undefined;
};

const ChatMessageComposer: React.FC<ChatMessageComposerProps> = ({
  selectedChat,
  messageToReply,
  scrollToMessage,
  truncateText,
  setMessageToReply,
  message,
  messageError,
  setMessage,
  handleChangeMessageInput,
  setInputHeight,
  handleSubmitMessage,
  dj,
}) => {
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const submitMessage = () => {
    const textarea = messageInputRef.current;
    if (!textarea) return;

    handleSubmitMessage(selectedChat, message, messageToReply, textarea);
  };

  return (
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
                type="button"
                aria-label="Cancelar resposta"
                onClick={(event) => {
                  event.stopPropagation();
                  setMessageToReply(null);
                }}
                className="chat-position"
              >
                <FaTimes />
              </button>
            </div>
          )}
          <div className="chat-message-input-row">
            <Form.Control
              as="textarea"
              rows={1}
              placeholder="Digite sua mensagem"
              className="my-3 custom-input chat-input"
              value={message}
              ref={messageInputRef}
              onChange={handleChangeMessageInput}
              onInput={(event) => {
                const textarea = event.currentTarget;
                textarea.style.height = "auto";
                const newHeight = Math.min(textarea.scrollHeight, 150);
                textarea.style.height = `${newHeight}px`;
                setInputHeight(newHeight - 50);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitMessage();
                }
              }}
            />
            <ChatEmojiPicker
              message={message}
              setMessage={setMessage}
              setInputHeight={setInputHeight}
              inputRef={messageInputRef}
            />
          </div>
          {messageError && (
            <div className="chat-message-error" role="alert">
              {messageError}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="primary"
          className="my-3 chat-margin-left"
          aria-label="Enviar mensagem"
          onClick={submitMessage}
        >
          <FaPaperPlane />
        </Button>
      </div>
    </div>
  );
};

export default ChatMessageComposer;
